import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { CoursesService } from '../../course/courses.service';
import { CategoriesService } from '../../category/categories.service';
import {
  SessionFormatEnum,
  SkillLevelEnum,
  CurrencyEnum,
} from '../../course/schema/course.schema';

async function seedCoursesFromPricingPage() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);
  const categoriesService = app.get(CategoriesService);

  console.log('🌱 Starting course seeding from pricing page data...');

  try {
    // Create categories first
    const categories = [
      {
        name: 'Professional Development',
        slug: 'professional-development',
        description: 'Career advancement and professional skills training',
        icon: 'fas fa-briefcase',
        color: '#2c3e50',
        subcategories: [
          'Leadership',
          'Management',
          'Corporate Training',
          'Team Building',
        ],
        order: 1,
        isActive: true,
        isFeatured: true,
      },
      {
        name: 'Business Training',
        slug: 'business-training',
        description: 'Business skills and organizational development',
        icon: 'fas fa-chart-line',
        color: '#3498db',
        subcategories: ['Strategy', 'Operations', 'Finance', 'Marketing'],
        order: 2,
        isActive: true,
        isFeatured: true,
      },
    ];

    for (const category of categories) {
      try {
        await categoriesService.create(category);
        console.log(`✅ Created category: ${category.name}`);
      } catch (error) {
        console.log(`⚠️  Category ${category.name} already exists`);
      }
    }

    // Fetch category IDs by slug
    const professionalDevCategory = await categoriesService.findBySlug(
      'professional-development',
    );
    const businessTrainingCategory =
      await categoriesService.findBySlug('business-training');

    if (!professionalDevCategory || !businessTrainingCategory) {
      throw new Error(
        'Categories not found! Please ensure categories are created first.',
      );
    }

    console.log(`✅ Found categories:`);
    console.log(`   - Professional Development: ${professionalDevCategory.id}`);
    console.log(`   - Business Training: ${businessTrainingCategory.id}\n`);

    // IMPORTANT: Replace with actual instructor ID from your database
    const instructorId = '6903c027053f3ed74ac25eb9'; // REPLACE THIS!

    // Course Plans based on pricing page
    const courses = [
      // ==========================================
      // PLAN 1: $77/month - Basic Access
      // ==========================================
      {
        title: 'Basic Professional Development Program',
        slug: 'basic-professional-development-program',
        subtitle: 'Essential Skills Training - Monthly Access',
        description:
          'Get started with professional development. Access essential training materials, live sessions, and core learning resources.',
        category: 'professional-development',
        subcategories: ['Leadership'],
        topics: [
          'Professional Skills',
          'Communication',
          'Time Management',
          'Goal Setting',
        ],
        overview:
          'Monthly subscription providing access to core professional development content. Perfect for individuals starting their career development journey.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1552664730-d307ca884978',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2025-01-06',
                endDate: '2025-01-06',
                startTime: '09:00',
                endTime: '10:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            seatsLeft: 25,
          },
          {
            type: SessionFormatEnum.WEEKEND,
            timeBlocks: [
              {
                startDate: '2025-01-11',
                endDate: '2025-01-11',
                startTime: '10:00',
                endTime: '11:30',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            seatsLeft: 25,
          },
        ],
        snapshot: {
          totalLectures: 30,
          totalDuration: 15,
          skillLevel: SkillLevelEnum.BEGINNER,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: false,
          mobileAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Essential professional communication skills',
            'Time management and productivity techniques',
            'Basic leadership principles',
            'Goal setting and achievement strategies',
            'Professional networking fundamentals',
          ],
          requirements: [
            'Internet connection',
            'Commitment to learning',
            'Basic computer skills',
          ],
          targetAudience: [
            'Early career professionals',
            'Individuals seeking career advancement',
            'Team members wanting to improve skills',
          ],
          features: [
            'Monthly subscription access',
            'Live Q&A sessions',
            'Community forum access',
            'Monthly progress tracking',
            'Certificate upon completion',
          ],
        },
        faqs: [
          {
            question: 'Can I cancel anytime?',
            answer:
              'Yes, you can cancel your subscription at any time. You will have access until the end of your billing period.',
          },
          {
            question: 'Is there a free trial?',
            answer:
              'We offer a 7-day money-back guarantee on all subscriptions.',
          },
          {
            question: 'How often is content updated?',
            answer:
              'We add new content monthly and update existing materials regularly.',
          },
        ],
        price: 77.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
        isNew: true,
      },

      // ==========================================
      // PLAN 2: $333 One-time - Standard Course
      // ==========================================
      {
        title: 'Standard Corporate Training Program',
        slug: 'standard-corporate-training-program',
        subtitle: 'Comprehensive Professional Skills - One-time Payment',
        description:
          'Complete professional development program with lifetime access. Includes all core training modules, live sessions, and certification.',
        category: 'professional-development',
        subcategories: ['Management', 'Leadership'],
        topics: [
          'Leadership Development',
          'Team Management',
          'Strategic Planning',
          'Performance Management',
        ],
        overview:
          'One-time investment for lifetime access to comprehensive corporate training. Perfect for professionals committed to long-term career development.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1542744173-8e7e53415bb0',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2025-02-03',
                endDate: '2025-02-07',
                startTime: '09:00',
                endTime: '12:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            seatsLeft: 18,
          },
          {
            type: SessionFormatEnum.EVENING,
            timeBlocks: [
              {
                startDate: '2025-02-05',
                endDate: '2025-02-05',
                startTime: '13:00',
                endTime: '16:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            seatsLeft: 18,
          },
        ],
        snapshot: {
          totalLectures: 75,
          totalDuration: 35,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          captionsLanguage: 'English, Spanish',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
          mobileAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Advanced leadership and management skills',
            'Strategic planning and execution',
            'Team building and performance management',
            'Effective communication at all levels',
            'Change management techniques',
            'Organizational development strategies',
            'Conflict resolution and negotiation',
            'Decision-making frameworks',
          ],
          requirements: [
            'Internet connection and device',
            '1-2 years professional experience recommended',
            'Willingness to practice and apply concepts',
          ],
          targetAudience: [
            'Mid-level managers',
            'Team leads and supervisors',
            'Aspiring leaders',
            'Business owners and entrepreneurs',
            'HR professionals',
          ],
          features: [
            'Lifetime access to all content',
            '75 comprehensive video lessons',
            'Downloadable resources and templates',
            'Live Q&A sessions (quarterly)',
            'Professional certificate',
            'Access to alumni network',
            'Free updates and new content',
          ],
        },
        faqs: [
          {
            question: 'Do I get lifetime access?',
            answer:
              'Yes! One-time payment gives you lifetime access to all course materials, including future updates.',
          },
          {
            question: 'Is there a certification?',
            answer:
              'Yes, you will receive a professional certificate upon successful completion of the program.',
          },
          {
            question: 'What if I need help during the course?',
            answer:
              'You can ask questions in our community forum and join quarterly live Q&A sessions with instructors.',
          },
          {
            question: 'Can I access on mobile devices?',
            answer:
              'Yes, all content is mobile-friendly and accessible on any device.',
          },
        ],
        price: 333.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: true,
        isBestseller: true,
        isNew: false,
      },

      // ==========================================
      // PLAN 3: $147/month - Premium Access
      // ==========================================
      {
        title: 'Premium Executive Development Program',
        slug: 'premium-executive-development-program',
        subtitle: 'Elite Professional Training - Monthly Premium',
        description:
          'Premium tier with exclusive content, personalized coaching, and advanced training materials. Designed for executives and senior professionals.',
        category: 'business-training',
        subcategories: ['Strategy', 'Operations'],
        topics: [
          'Executive Leadership',
          'Strategic Management',
          'Innovation',
          'Digital Transformation',
        ],
        overview:
          'Premium monthly subscription with exclusive executive-level content, 1-on-1 coaching sessions, and advanced strategic training.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1521737711867-e3b97375f902',
        sessions: [
          {
            type: SessionFormatEnum.SPLIT_WEEK,
            timeBlocks: [
              {
                startDate: '2025-03-03',
                endDate: '2025-03-04',
                startTime: '09:00',
                endTime: '12:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            seatsLeft: 10,
          },
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2025-03-05',
                endDate: '2025-03-05',
                startTime: '14:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            seatsLeft: 10,
          },
          {
            type: SessionFormatEnum.EVENING,
            timeBlocks: [
              {
                startDate: '2025-03-06',
                endDate: '2025-03-06',
                startTime: '10:00',
                endTime: '11:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            seatsLeft: 5,
          },
        ],
        snapshot: {
          totalLectures: 120,
          totalDuration: 60,
          skillLevel: SkillLevelEnum.ADVANCED,
          language: 'English',
          captionsLanguage: 'English, Spanish, French, German',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: false,
          mobileAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Executive-level strategic thinking',
            'Advanced organizational leadership',
            'Digital transformation strategies',
            'Innovation and change management',
            'High-stakes decision making',
            'Global business perspectives',
            'Crisis and risk management',
            'Stakeholder management at the highest level',
            'Personal executive branding',
            'Work-life integration strategies',
          ],
          requirements: [
            'Senior management or executive experience',
            'Commitment to monthly coaching sessions',
            'Strategic mindset',
            'High-speed internet for live sessions',
          ],
          targetAudience: [
            'C-level executives (CEO, CFO, COO, CTO)',
            'Senior vice presidents',
            'Division heads and directors',
            'Business owners with large teams',
            'Aspiring C-suite professionals',
          ],
          features: [
            'Monthly premium access',
            '120+ executive-level video lessons',
            'Monthly 1-on-1 coaching session (60 mins)',
            'Exclusive executive community',
            'Priority support',
            'Advanced case studies',
            'Weekly live masterclasses',
            'Personalized learning paths',
            'Networking events (virtual & in-person)',
            'Executive certificate',
            'Access to senior advisor network',
          ],
        },
        faqs: [
          {
            question: 'What makes Premium different from Standard?',
            answer:
              'Premium includes monthly 1-on-1 coaching, exclusive executive content, weekly live masterclasses, and priority access to all new features and content.',
          },
          {
            question: 'Who are the coaches?',
            answer:
              'Our coaches are experienced C-level executives and senior business leaders with 20+ years of experience in Fortune 500 companies.',
          },
          {
            question: 'Can I switch between plans?',
            answer:
              'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
          },
          {
            question: 'Is there a minimum commitment?',
            answer:
              'No minimum commitment. You can cancel anytime, though we recommend at least 3 months to see meaningful results.',
          },
          {
            question: 'Do you offer group/corporate rates?',
            answer:
              'Yes! Contact our corporate team for special pricing for teams of 5 or more.',
          },
        ],
        price: 147.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: true,
        isBestseller: false,
        isNew: true,
      },

      // ==========================================
      // PLAN 4: $997 One-time - All Access Pass
      // ==========================================
      {
        title: 'Complete Executive Mastery - All Access Pass',
        slug: 'complete-executive-mastery-all-access',
        subtitle: 'Lifetime Premium Access - Complete Package',
        description:
          'Ultimate professional development package. Lifetime access to all premium content, unlimited coaching credits, and exclusive executive resources.',
        category: 'business-training',
        subcategories: ['Strategy', 'Operations', 'Finance', 'Marketing'],
        topics: [
          'Executive Leadership',
          'Strategic Management',
          'Financial Acumen',
          'Marketing Strategy',
          'Operations Excellence',
          'Innovation',
          'Digital Transformation',
          'Organizational Development',
        ],
        overview:
          'The complete executive development solution. One-time investment for lifetime premium access to all content, quarterly 1-on-1 coaching, and exclusive executive network.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2025-04-07',
                endDate: '2025-04-11',
                startTime: '09:00',
                endTime: '10:30',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            seatsLeft: 8,
          },
          {
            type: SessionFormatEnum.SPLIT_WEEK,
            timeBlocks: [
              {
                startDate: '2025-04-15',
                endDate: '2025-04-16',
                startTime: '13:00',
                endTime: '16:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            seatsLeft: 8,
          },
          // Include all session formats from previous tiers via curriculum builder
        ],
        snapshot: {
          totalLectures: 250,
          totalDuration: 120,
          skillLevel: SkillLevelEnum.ALL_LEVELS,
          language: 'English',
          captionsLanguage: 'English, Spanish, French, German, Mandarin',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
          mobileAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Everything from Basic, Standard, and Premium tiers',
            'Advanced executive strategies across all business functions',
            'Complete strategic framework implementation',
            'Global business expansion strategies',
            'Mergers and acquisitions fundamentals',
            'Board-level governance',
            'Investor relations and fundraising',
            'Building and scaling organizations',
            'Legacy and succession planning',
            'Executive wellness and resilience',
          ],
          requirements: [
            'Professional or leadership experience',
            'Commitment to comprehensive learning',
            'Strategic business mindset',
          ],
          targetAudience: [
            'Senior executives and C-suite',
            'Entrepreneurs and business owners',
            'High-potential leaders',
            'Anyone serious about reaching executive level',
            'Consultants and advisors',
          ],
          features: [
            'LIFETIME access to ALL content (past, present, future)',
            '250+ comprehensive video lessons',
            'Quarterly 1-on-1 executive coaching (4 sessions/year)',
            'All future course updates FREE forever',
            'Exclusive executive network access',
            'VIP community forum',
            'Priority support (24-hour response)',
            'Advanced certification',
            'In-person executive retreat (annual)',
            'Mastermind group access',
            'Guest speaker series access',
            'All downloadable resources',
            'Mobile app premium features',
            'Custom learning path consultation',
            'Resume/LinkedIn review service',
          ],
        },
        faqs: [
          {
            question: 'Is this really lifetime access?',
            answer:
              'Yes! One payment, lifetime access. You will never be charged again and will receive all future updates and new content free forever.',
          },
          {
            question: 'What about the coaching sessions?',
            answer:
              'You get 4 executive coaching sessions per year (one per quarter) for life. Each session is 60 minutes with a senior executive coach.',
          },
          {
            question: 'Can I use this for my entire team?',
            answer:
              'This is an individual license. For team licensing, please contact our corporate sales team for custom pricing.',
          },
          {
            question: 'What if I am not satisfied?',
            answer:
              'We offer a 30-day money-back guarantee. If you are not completely satisfied, we will refund your full payment.',
          },
          {
            question: 'How is this different from the $333 Standard plan?',
            answer:
              'In addition to lifetime access to more content (250 vs 75 lessons), you get quarterly coaching sessions, access to executive retreats, mastermind groups, and VIP network - valued at over $5,000/year.',
          },
          {
            question: 'Can I pay in installments?',
            answer:
              'Yes! We offer payment plans. Contact our support team for installment options.',
          },
        ],
        price: 997.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: true,
        isBestseller: true,
        isNew: true,
      },
    ];

    console.log(
      '\n⚠️  IMPORTANT: Update the instructorId variable with a valid MongoDB ObjectId',
    );
    console.log(`Current instructorId: ${instructorId}\n`);

    for (const courseData of courses) {
      try {
        // Replace category slug with actual ObjectId
        let categoryId: string;
        if (courseData.category === 'professional-development') {
          categoryId = professionalDevCategory.id;
        } else if (courseData.category === 'business-training') {
          categoryId = businessTrainingCategory.id;
        } else {
          throw new Error(`Unknown category: ${courseData.category}`);
        }

        const course = await coursesService.create({
          ...courseData,
          category: categoryId,
          instructor: instructorId,
        });
        console.log(`✅ Created course: ${courseData.title}`);
        console.log(`   Slug: ${course.slug}`);
        console.log(`   Price: $${courseData.price} ${courseData.currency}`);
        console.log('');
      } catch (error) {
        console.error(
          `❌ Error creating course ${courseData.title}:`,
          error.message,
        );
      }
    }

    console.log('✨ Course seeding completed!');
    console.log('\n📊 Summary:');
    console.log('   - Basic Plan: $77/month');
    console.log('   - Standard Plan: $333 one-time');
    console.log('   - Premium Plan: $147/month');
    console.log('   - All Access Pass: $997 one-time');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

// Run the seed function
seedCoursesFromPricingPage()
  .then(() => {
    console.log('\n👋 Seeding process complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
