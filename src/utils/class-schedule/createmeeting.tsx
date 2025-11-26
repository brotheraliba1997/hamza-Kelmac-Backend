import { randomUUID } from 'crypto';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../../config/config.type';
import { MailService } from '../../mail/mail.service';
import { Model } from 'mongoose';
import { ClassScheduleSchemaClass } from '../../classSchedule/schema/class-schedule.schema';

/**
 * 📅 REUSABLE FUNCTION: Create Google Meet Link
 * 
 * Google Calendar event create karke Meet link generate karta hai
 * 
 * @param oauth2Client - Google OAuth2 Client
 * @param accessToken - User's access token
 * @param refreshToken - User's refresh token
 * @param eventData - Event details (date, time, duration)
 * @returns Object with googleMeetLink and googleCalendarEventLink
 */
export async function createGoogleMeetLink(
  oauth2Client: any,
  accessToken: string,
  refreshToken: string,
  eventData: {
    date: string;
    time: string;
    duration: number;
    summary?: string;
    description?: string;
  },
) {
  // Set credentials
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  // Initialize Google Calendar API
  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client,
  });

  // Create event object
  const event = {
    summary: eventData.summary || 'Scheduled Class',
    description:
      eventData.description ||
      'Auto-generated class schedule with Google Meet link',
    start: {
      dateTime: `${eventData.date}T${eventData.time}:00Z`,
      timeZone: 'Asia/Karachi',
    },
    end: {
      dateTime: new Date(
        new Date(`${eventData.date}T${eventData.time}:00Z`).getTime() +
          eventData.duration * 60000,
      ).toISOString(),
      timeZone: 'Asia/Karachi',
    },
    conferenceData: {
      createRequest: {
        requestId: randomUUID(),
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  // Insert event into calendar
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    conferenceDataVersion: 1,
  });

  // Extract Meet link and calendar link
  const googleMeetLink =
    response.data.conferenceData?.entryPoints?.[0]?.uri || '';
  const googleCalendarEventLink = response.data.htmlLink || '';

  return {
    googleMeetLink,
    googleCalendarEventLink,
    eventId: response.data.id,
  };
}

/**
 * 📧 REUSABLE FUNCTION: Send Class Schedule Emails
 * 
 * Admin, instructor aur students ko class schedule ka email bhejta hai
 * 
 * @param mailService - MailService instance
 * @param configService - ConfigService instance
 * @param classScheduleModel - ClassSchedule Model
 * @param scheduleId - Schedule ID
 * @returns Success status
 */
export async function sendScheduleEmails(
  mailService: MailService,
  configService: ConfigService<AllConfigType>,
  classScheduleModel: Model<ClassScheduleSchemaClass>,
  scheduleId: string,
) {
  // Populate schedule with course, instructor, students
  const populatedSchedule = await classScheduleModel
    .findById(scheduleId)
    .populate([
      { path: 'course' },
      { path: 'instructor' },
      { path: 'students' },
    ])
    .lean();

  if (!populatedSchedule) {
    console.error('Schedule not found for email notification');
    return { success: false, message: 'Schedule not found' };
  }

  const course = populatedSchedule.course as any;
  const instructor = populatedSchedule.instructor as any;
  const students = populatedSchedule.students as any[];

  // Get admin email from config
  const adminEmail = configService.get('app.adminEmail', {
    infer: true,
  });

  // Format lesson date
  const lessonDate = new Date(populatedSchedule.date).toLocaleDateString(
    'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  );

  // Prepare email data
  const emailData = {
    courseName: course?.title || 'Unknown Course',
    instructorName: instructor?.firstName
      ? `${instructor.firstName} ${instructor.lastName || ''}`
      : instructor?.email || 'Unknown Instructor',
    lessonDate,
    lessonTime: populatedSchedule.time,
    duration: populatedSchedule.duration,
    googleMeetLink: populatedSchedule.googleMeetLink,
  };

  const emailResults = {
    admin: false,
    instructor: false,
    students: [] as boolean[],
  };

  try {
    // Send email to admin
    if (adminEmail) {
      await mailService.lessonScheduled({
        to: adminEmail,
        data: emailData,
      });
      emailResults.admin = true;
      console.log(`✅ Email sent to admin: ${adminEmail}`);
    }

    // Send email to instructor
    if (instructor?.email) {
      await mailService.lessonScheduled({
        to: instructor.email,
        data: emailData,
      });
      emailResults.instructor = true;
      console.log(`✅ Email sent to instructor: ${instructor.email}`);
    }

    // Send email to students (optional - currently commented)
    // for (const student of students) {
    //   if (student?.email) {
    //     await mailService.lessonScheduled({
    //       to: student.email,
    //       data: emailData,
    //     });
    //     emailResults.students.push(true);
    //     console.log(`✅ Email sent to student: ${student.email}`);
    //   }
    // }

    return {
      success: true,
      message: 'Emails sent successfully',
      results: emailResults,
    };
  } catch (error) {
    console.error('Failed to send lesson schedule emails:', error);
    return {
      success: false,
      message: 'Failed to send emails',
      error: error.message,
    };
  }
}

/**
 * 🎯 COMPLETE FUNCTION: Create Class with Google Meet and Email
 * 
 * Complete flow: Meet link banao + Schedule create karo + Emails bhejo
 * 
 * @param params - All required parameters
 * @returns Created schedule with meet link
 */
export async function createClassWithMeetAndEmail(params: {
  oauth2Client: any;
  accessToken: string;
  refreshToken: string;
  mailService: MailService;
  configService: ConfigService<AllConfigType>;
  classScheduleModel: Model<ClassScheduleSchemaClass>;
  scheduleData: {
    date: string;
    time: string;
    duration: number;
    course: string;
    instructor: string;
    students: string[];
  };
}) {
  const {
    oauth2Client,
    accessToken,
    refreshToken,
    mailService,
    configService,
    classScheduleModel,
    scheduleData,
  } = params;

  try {
    // Step 1: Create Google Meet Link
    const meetLinkData = await createGoogleMeetLink(
      oauth2Client,
      accessToken,
      refreshToken,
      {
        date: scheduleData.date,
        time: scheduleData.time,
        duration: scheduleData.duration,
      },
    );

    console.log('✅ Google Meet link created:', meetLinkData.googleMeetLink);

    // Step 2: Create schedule with meet link
    const schedule = await classScheduleModel.create({
      ...scheduleData,
      googleMeetLink: meetLinkData.googleMeetLink,
      googleCalendarEventLink: meetLinkData.googleCalendarEventLink,
      securityKey: randomUUID(),
    });

    console.log('✅ Schedule created:', schedule._id);

    // Step 3: Send email notifications
    const emailResult = await sendScheduleEmails(
      mailService,
      configService,
      classScheduleModel,
      schedule._id.toString(),
    );

    console.log('✅ Email notifications:', emailResult.message);

    return {
      success: true,
      schedule,
      meetLink: meetLinkData.googleMeetLink,
      emailsSent: emailResult.success,
    };
  } catch (error) {
    console.error('Error in createClassWithMeetAndEmail:', error);
    throw error;
  }
}

