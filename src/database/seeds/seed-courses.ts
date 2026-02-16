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
import { convertIdToString } from '../../utils/convert-id';

async function seedCourses() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const coursesService = app.get(CoursesService);
  const categoriesService = app.get(CategoriesService);

  console.log('🌱 Starting course seeding...');

  try {
    // Get or create categories
    let professionalDevCategory: any;
    let businessTrainingCategory: any;

    try {
      professionalDevCategory = await categoriesService.findBySlug(
        'professional-development',
      );
    } catch (error) {
      // Category doesn't exist, create it
      professionalDevCategory = await categoriesService.create({
        name: 'Professional Development',
        slug: 'professional-development',
        description: 'Career advancement and professional skills training',
        icon: 'fas fa-briefcase',
        color: '#2c3e50',
        subcategories: ['Leadership', 'Management', 'Corporate Training'],
        order: 1,
        isActive: true,
        isFeatured: true,
      });
      console.log(`✅ Created category: Professional Development`);
    }

    try {
      businessTrainingCategory =
        await categoriesService.findBySlug('business-training');
    } catch (error) {
      // Category doesn't exist, create it
      businessTrainingCategory = await categoriesService.create({
        name: 'Business Training',
        slug: 'business-training',
        description: 'Business skills and organizational development',
        icon: 'fas fa-chart-line',
        color: '#3498db',
        subcategories: ['Strategy', 'Operations', 'Finance', 'Marketing'],
        order: 2,
        isActive: true,
        isFeatured: true,
      });
      console.log(`✅ Created category: Business Training`);
    }

    // Get category IDs using convertIdToString utility
    const professionalDevCategoryId = convertIdToString(
      professionalDevCategory,
    );
    const businessTrainingCategoryId = convertIdToString(
      businessTrainingCategory,
    );

    if (!professionalDevCategoryId || !businessTrainingCategoryId) {
      console.error('Category objects:', {
        professionalDev: professionalDevCategory,
        business: businessTrainingCategory,
      });
      throw new Error(
        'Failed to get category IDs. Please check category creation.',
      );
    }

    console.log(`✅ Category IDs:`);
    console.log(`   - Professional Development: ${professionalDevCategoryId}`);
    console.log(`   - Business Training: ${businessTrainingCategoryId}\n`);

    // IMPORTANT: Replace with actual instructor ID from your database
    const instructorId = '690ca50a894467cca53ecb92'; // REPLACE THIS!
    const locationId = '6931b6698080a892831ad377'; // REPLACE THIS!

    // 20 Courses Data
    const courses = [
      {
        title: 'Advanced Leadership Mastery',
        slug: 'advanced-leadership-mastery',
        subtitle: 'Transform into an Exceptional Leader',
        description:
          'Master advanced leadership techniques and strategies to lead high-performing teams and drive organizational success.',
        category: professionalDevCategoryId,
        hasTest: false,
        subcategories: ['Leadership', 'Management'],
        topics: [
          'Strategic Leadership',
          'Team Building',
          'Decision Making',
          'Conflict Resolution',
        ],
        overview:
          'Comprehensive leadership program designed for senior managers and executives looking to enhance their leadership capabilities.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1552664730-d307ca884978',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2025-12-02',
                endDate: '2025-12-06',
                startTime: '09:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            mode: 'online',
            seatsLeft: 20,
          },
          {
            type: SessionFormatEnum.WEEKEND,
            timeBlocks: [
              {
                startDate: '2025-12-07',
                endDate: '2025-12-08',
                startTime: '10:00',
                endTime: '16:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 20,
          },
        ],
        snapshot: {
          totalLectures: 45,
          totalDuration: 40,
          skillLevel: SkillLevelEnum.ADVANCED,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Advanced leadership frameworks',
            'Strategic decision-making processes',
            'Building high-performance teams',
            'Change management strategies',
          ],
          requirements: [
            '5+ years management experience',
            'Commitment to learning',
          ],
          targetAudience: ['Senior Managers', 'Executives', 'Team Leaders'],
          features: [
            'Lifetime access',
            'Certificate',
            '1-on-1 coaching sessions',
          ],
        },
        faqs: [
          {
            question: 'Is this course suitable for beginners?',
            answer:
              'This course is designed for experienced managers and leaders.',
          },
        ],
        price: 499.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: true,
        isBestseller: true,
      },
      {
        title: 'Digital Marketing Fundamentals',
        slug: 'digital-marketing-fundamentals',
        subtitle: 'Master Online Marketing Strategies',
        description:
          'Learn the fundamentals of digital marketing including SEO, social media, content marketing, and analytics.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Marketing'],
        topics: ['SEO', 'Social Media', 'Content Marketing', 'Analytics'],
        overview:
          'Complete guide to digital marketing for businesses and marketers.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
        sessions: [
          {
            type: SessionFormatEnum.SPLIT_WEEK,
            timeBlocks: [
              {
                startDate: '2025-12-09',
                endDate: '2025-12-10',
                startTime: '14:00',
                endTime: '18:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
              {
                startDate: '2025-12-12',
                endDate: '2025-12-13',
                startTime: '14:00',
                endTime: '18:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 25,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 35,
          totalDuration: 25,
          skillLevel: SkillLevelEnum.BEGINNER,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'SEO optimization techniques',
            'Social media marketing strategies',
            'Content creation and distribution',
            'Marketing analytics and reporting',
          ],
          requirements: ['Basic computer skills', 'Internet connection'],
          targetAudience: [
            'Marketing Professionals',
            'Business Owners',
            'Entrepreneurs',
          ],
          features: [
            'Practical exercises',
            'Real-world case studies',
            'Certificate',
          ],
        },
        price: 299.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Project Management Professional',
        slug: 'project-management-professional',
        subtitle: 'PMP Certification Prep Course',
        description:
          'Comprehensive project management training covering PMP exam preparation and real-world project execution.',
        category: professionalDevCategoryId,
        hasTest: false,
        subcategories: ['Management'],
        topics: [
          'Project Planning',
          'Risk Management',
          'Stakeholder Management',
          'Agile',
        ],
        overview:
          'Prepare for PMP certification while learning practical project management skills.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
        sessions: [
          {
            type: SessionFormatEnum.EVENING,
            timeBlocks: [
              {
                startDate: '2025-12-16',
                endDate: '2025-12-20',
                startTime: '18:00',
                endTime: '21:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 15,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 60,
          totalDuration: 50,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'PMP exam preparation',
            'Project lifecycle management',
            'Risk and quality management',
            'Agile and Scrum methodologies',
          ],
          requirements: ['Project management experience recommended'],
          targetAudience: ['Project Managers', 'Team Leads', 'Aspiring PMPs'],
          features: ['PMP exam prep', 'Practice tests', 'Certificate'],
        },
        price: 599.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: true,
        isBestseller: true,
      },
      {
        title: 'Financial Analysis & Reporting',
        slug: 'financial-analysis-reporting',
        subtitle: 'Master Financial Data Analysis',
        description:
          'Learn to analyze financial statements, create reports, and make data-driven financial decisions.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Finance'],
        topics: [
          'Financial Statements',
          'Ratio Analysis',
          'Budgeting',
          'Forecasting',
        ],
        overview:
          'Comprehensive financial analysis course for business professionals.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2025-12-23',
                endDate: '2025-12-27',
                startTime: '10:00',
                endTime: '15:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 18,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 40,
          totalDuration: 30,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Financial statement analysis',
            'Financial ratio calculations',
            'Budget creation and management',
            'Financial forecasting techniques',
          ],
          requirements: ['Basic accounting knowledge'],
          targetAudience: ['Finance Professionals', 'Managers', 'Analysts'],
          features: ['Excel templates', 'Case studies', 'Certificate'],
        },
        price: 399.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Data Science Essentials',
        slug: 'data-science-essentials',
        subtitle: 'Introduction to Data Science',
        description:
          'Learn data science fundamentals including Python, statistics, machine learning, and data visualization.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Strategy'],
        topics: [
          'Python',
          'Statistics',
          'Machine Learning',
          'Data Visualization',
        ],
        overview: 'Complete introduction to data science for beginners.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        sessions: [
          {
            type: SessionFormatEnum.WEEKEND,
            timeBlocks: [
              {
                startDate: '2026-01-04',
                endDate: '2026-01-05',
                startTime: '09:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
              {
                startDate: '2026-01-11',
                endDate: '2026-01-12',
                startTime: '09:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 22,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 50,
          totalDuration: 35,
          skillLevel: SkillLevelEnum.BEGINNER,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Python programming basics',
            'Statistical analysis',
            'Machine learning fundamentals',
            'Data visualization with Python',
          ],
          requirements: ['Basic programming knowledge helpful'],
          targetAudience: [
            'Aspiring Data Scientists',
            'Analysts',
            'Developers',
          ],
          features: ['Hands-on projects', 'Jupyter notebooks', 'Certificate'],
        },
        price: 449.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: true,
        isBestseller: false,
      },
      {
        title: 'Effective Communication Skills',
        slug: 'effective-communication-skills',
        subtitle: 'Master Professional Communication',
        description:
          'Enhance your communication skills for better workplace relationships and career success.',
        category: professionalDevCategoryId,
        hasTest: false,
        subcategories: ['Corporate Training'],
        topics: [
          'Public Speaking',
          'Written Communication',
          'Active Listening',
          'Negotiation',
        ],
        overview: 'Comprehensive communication training for professionals.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
        sessions: [
          {
            type: SessionFormatEnum.EVENING,
            timeBlocks: [
              {
                startDate: '2026-01-13',
                endDate: '2026-01-17',
                startTime: '18:00',
                endTime: '20:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 30,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 25,
          totalDuration: 20,
          skillLevel: SkillLevelEnum.BEGINNER,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Public speaking techniques',
            'Effective writing skills',
            'Active listening strategies',
            'Negotiation and persuasion',
          ],
          requirements: ['None'],
          targetAudience: ['All Professionals', 'Students', 'Managers'],
          features: ['Practice sessions', 'Video feedback', 'Certificate'],
        },
        price: 199.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Strategic Business Planning',
        slug: 'strategic-business-planning',
        subtitle: 'Build Winning Business Strategies',
        description:
          'Learn to create comprehensive business plans and strategic roadmaps for organizational success.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Strategy'],
        topics: [
          'Business Planning',
          'Strategic Analysis',
          'Goal Setting',
          'Execution',
        ],
        overview: 'Master the art of strategic business planning.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2026-01-20',
                endDate: '2026-01-24',
                startTime: '09:00',
                endTime: '16:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 16,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 35,
          totalDuration: 28,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Business plan creation',
            'SWOT and competitive analysis',
            'Strategic goal setting',
            'Implementation planning',
          ],
          requirements: ['Business experience recommended'],
          targetAudience: ['Business Owners', 'Managers', 'Entrepreneurs'],
          features: ['Business plan templates', 'Case studies', 'Certificate'],
        },
        price: 349.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Agile & Scrum Mastery',
        slug: 'agile-scrum-mastery',
        subtitle: 'Become a Certified Scrum Master',
        description:
          'Master Agile methodologies and Scrum framework for effective project delivery.',
        category: professionalDevCategoryId,
        hasTest: false,
        subcategories: ['Management'],
        topics: [
          'Agile Principles',
          'Scrum Framework',
          'Sprint Planning',
          'Retrospectives',
        ],
        overview: 'Complete Agile and Scrum certification course.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1551434678-e076c223a692',
        sessions: [
          {
            type: SessionFormatEnum.SPLIT_WEEK,
            timeBlocks: [
              {
                startDate: '2026-01-27',
                endDate: '2026-01-28',
                startTime: '10:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
              {
                startDate: '2026-01-30',
                endDate: '2026-01-31',
                startTime: '10:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 20,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 30,
          totalDuration: 24,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Agile principles and values',
            'Scrum framework mastery',
            'Sprint planning and execution',
            'Team facilitation techniques',
          ],
          requirements: ['Project management experience'],
          targetAudience: ['Scrum Masters', 'Product Owners', 'Team Leads'],
          features: ['CSM prep', 'Practice exercises', 'Certificate'],
        },
        price: 549.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: true,
        isBestseller: true,
      },
      {
        title: 'Customer Service Excellence',
        slug: 'customer-service-excellence',
        subtitle: 'Deliver Outstanding Customer Experiences',
        description:
          'Learn to provide exceptional customer service and build lasting customer relationships.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Operations'],
        topics: [
          'Customer Relations',
          'Problem Solving',
          'Service Recovery',
          'CRM',
        ],
        overview: 'Comprehensive customer service training program.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1556761175-4b46a572b786',
        sessions: [
          {
            type: SessionFormatEnum.EVENING,
            timeBlocks: [
              {
                startDate: '2026-02-03',
                endDate: '2026-02-07',
                startTime: '19:00',
                endTime: '21:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 35,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 20,
          totalDuration: 15,
          skillLevel: SkillLevelEnum.BEGINNER,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Customer service best practices',
            'Handling difficult customers',
            'Service recovery techniques',
            'CRM system usage',
          ],
          requirements: ['None'],
          targetAudience: [
            'Customer Service Reps',
            'Support Staff',
            'Managers',
          ],
          features: ['Role-playing exercises', 'Case studies', 'Certificate'],
        },
        price: 149.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Supply Chain Management',
        slug: 'supply-chain-management',
        subtitle: 'Optimize Your Supply Chain',
        description:
          'Master supply chain management principles, logistics, and optimization strategies.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Operations'],
        topics: [
          'Logistics',
          'Inventory Management',
          'Procurement',
          'Distribution',
        ],
        overview: 'Complete supply chain management course.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2026-02-10',
                endDate: '2026-02-14',
                startTime: '09:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 18,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 40,
          totalDuration: 32,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Supply chain fundamentals',
            'Inventory optimization',
            'Procurement strategies',
            'Distribution network design',
          ],
          requirements: ['Business background helpful'],
          targetAudience: [
            'Operations Managers',
            'Logistics Professionals',
            'Procurement',
          ],
          features: [
            'Industry case studies',
            'Tools and templates',
            'Certificate',
          ],
        },
        price: 429.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Time Management Mastery',
        slug: 'time-management-mastery',
        subtitle: 'Maximize Your Productivity',
        description:
          'Learn proven time management techniques to increase productivity and achieve work-life balance.',
        category: professionalDevCategoryId,
        hasTest: false,
        subcategories: ['Corporate Training'],
        topics: [
          'Productivity',
          'Prioritization',
          'Goal Setting',
          'Work-Life Balance',
        ],
        overview: 'Transform your time management skills.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b',
        sessions: [
          {
            type: SessionFormatEnum.WEEKEND,
            timeBlocks: [
              {
                startDate: '2026-02-15',
                endDate: '2026-02-16',
                startTime: '10:00',
                endTime: '15:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 40,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 18,
          totalDuration: 12,
          skillLevel: SkillLevelEnum.BEGINNER,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Time management frameworks',
            'Priority setting techniques',
            'Delegation strategies',
            'Work-life balance principles',
          ],
          requirements: ['None'],
          targetAudience: ['All Professionals', 'Students', 'Managers'],
          features: ['Productivity tools', 'Action plans', 'Certificate'],
        },
        price: 99.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Sales & Business Development',
        slug: 'sales-business-development',
        subtitle: 'Master the Art of Selling',
        description:
          'Learn advanced sales techniques, negotiation skills, and business development strategies.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Marketing'],
        topics: [
          'Sales Techniques',
          'Negotiation',
          'Relationship Building',
          'Closing',
        ],
        overview: 'Comprehensive sales and business development training.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
        sessions: [
          {
            type: SessionFormatEnum.SPLIT_WEEK,
            timeBlocks: [
              {
                startDate: '2026-02-17',
                endDate: '2026-02-18',
                startTime: '14:00',
                endTime: '18:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
              {
                startDate: '2026-02-20',
                endDate: '2026-02-21',
                startTime: '14:00',
                endTime: '18:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 25,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 32,
          totalDuration: 26,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Advanced sales techniques',
            'Negotiation strategies',
            'Customer relationship management',
            'Closing techniques',
          ],
          requirements: ['Sales experience helpful'],
          targetAudience: [
            'Sales Professionals',
            'Business Developers',
            'Account Managers',
          ],
          features: ['Role-playing exercises', 'Sales scripts', 'Certificate'],
        },
        price: 379.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Human Resources Management',
        slug: 'human-resources-management',
        subtitle: 'Complete HR Management Course',
        description:
          'Master HR management including recruitment, employee relations, performance management, and compliance.',
        category: professionalDevCategoryId,
        hasTest: false,
        subcategories: ['Management'],
        topics: [
          'Recruitment',
          'Employee Relations',
          'Performance Management',
          'HR Compliance',
        ],
        overview: 'Comprehensive HR management training program.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2026-02-24',
                endDate: '2026-02-28',
                startTime: '10:00',
                endTime: '16:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 20,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 45,
          totalDuration: 38,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Recruitment and selection',
            'Employee relations management',
            'Performance evaluation systems',
            'HR compliance and legal requirements',
          ],
          requirements: ['HR experience helpful'],
          targetAudience: ['HR Professionals', 'Managers', 'Aspiring HR'],
          features: ['HR templates', 'Legal guidelines', 'Certificate'],
        },
        price: 479.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Business Analytics & Intelligence',
        slug: 'business-analytics-intelligence',
        subtitle: 'Data-Driven Decision Making',
        description:
          'Learn to analyze business data, create dashboards, and make data-driven business decisions.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Strategy'],
        topics: [
          'Data Analysis',
          'Business Intelligence',
          'Dashboards',
          'Reporting',
        ],
        overview: 'Master business analytics and intelligence tools.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        sessions: [
          {
            type: SessionFormatEnum.EVENING,
            timeBlocks: [
              {
                startDate: '2026-03-03',
                endDate: '2026-03-07',
                startTime: '18:00',
                endTime: '21:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 22,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 38,
          totalDuration: 30,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Business data analysis',
            'Dashboard creation',
            'KPI tracking and reporting',
            'Data visualization techniques',
          ],
          requirements: ['Basic Excel knowledge'],
          targetAudience: ['Analysts', 'Managers', 'Business Intelligence'],
          features: ['BI tools training', 'Dashboard templates', 'Certificate'],
        },
        price: 399.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Conflict Resolution & Mediation',
        slug: 'conflict-resolution-mediation',
        subtitle: 'Resolve Workplace Conflicts',
        description:
          'Learn effective conflict resolution and mediation techniques for the workplace.',
        category: professionalDevCategoryId,
        hasTest: false,
        subcategories: ['Corporate Training'],
        topics: [
          'Conflict Management',
          'Mediation',
          'Negotiation',
          'Communication',
        ],
        overview:
          'Master conflict resolution skills for better workplace harmony.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1552664730-d307ca884978',
        sessions: [
          {
            type: SessionFormatEnum.WEEKEND,
            timeBlocks: [
              {
                startDate: '2026-03-08',
                endDate: '2026-03-09',
                startTime: '09:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 28,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 22,
          totalDuration: 16,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Conflict identification and analysis',
            'Mediation techniques',
            'Negotiation strategies',
            'Communication in conflict situations',
          ],
          requirements: ['None'],
          targetAudience: ['Managers', 'HR Professionals', 'Team Leads'],
          features: ['Role-playing exercises', 'Case studies', 'Certificate'],
        },
        price: 249.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Operations Management Excellence',
        slug: 'operations-management-excellence',
        subtitle: 'Optimize Business Operations',
        description:
          'Learn to optimize business operations, improve efficiency, and reduce costs.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Operations'],
        topics: [
          'Process Optimization',
          'Quality Management',
          'Lean Principles',
          'Six Sigma',
        ],
        overview: 'Comprehensive operations management training.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2026-03-10',
                endDate: '2026-03-14',
                startTime: '09:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 18,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 42,
          totalDuration: 35,
          skillLevel: SkillLevelEnum.ADVANCED,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Process optimization techniques',
            'Quality management systems',
            'Lean and Six Sigma principles',
            'Operations strategy',
          ],
          requirements: ['Operations experience recommended'],
          targetAudience: [
            'Operations Managers',
            'Process Engineers',
            'Quality Managers',
          ],
          features: ['Process templates', 'Case studies', 'Certificate'],
        },
        price: 549.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: true,
        isBestseller: false,
      },
      {
        title: 'Team Building & Collaboration',
        slug: 'team-building-collaboration',
        subtitle: 'Build High-Performing Teams',
        description:
          'Learn to build, motivate, and manage high-performing teams for organizational success.',
        category: professionalDevCategoryId,
        hasTest: false,
        subcategories: ['Leadership'],
        topics: [
          'Team Building',
          'Collaboration',
          'Motivation',
          'Team Dynamics',
        ],
        overview: 'Master team building and collaboration strategies.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c',
        sessions: [
          {
            type: SessionFormatEnum.SPLIT_WEEK,
            timeBlocks: [
              {
                startDate: '2026-03-17',
                endDate: '2026-03-18',
                startTime: '10:00',
                endTime: '16:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
              {
                startDate: '2026-03-20',
                endDate: '2026-03-21',
                startTime: '10:00',
                endTime: '16:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 24,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 28,
          totalDuration: 22,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Team building strategies',
            'Collaboration tools and techniques',
            'Team motivation methods',
            'Managing team dynamics',
          ],
          requirements: ['Management experience helpful'],
          targetAudience: ['Team Leaders', 'Managers', 'HR Professionals'],
          features: ['Team exercises', 'Assessment tools', 'Certificate'],
        },
        price: 329.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Entrepreneurship Fundamentals',
        slug: 'entrepreneurship-fundamentals',
        subtitle: 'Start Your Business Journey',
        description:
          'Learn the fundamentals of entrepreneurship including business planning, funding, and growth strategies.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Strategy'],
        topics: [
          'Business Planning',
          'Funding',
          'Marketing',
          'Growth Strategies',
        ],
        overview:
          'Complete entrepreneurship course for aspiring business owners.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1556761175-4b46a572b786',
        sessions: [
          {
            type: SessionFormatEnum.WEEKEND,
            timeBlocks: [
              {
                startDate: '2026-03-22',
                endDate: '2026-03-23',
                startTime: '09:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
              {
                startDate: '2026-03-29',
                endDate: '2026-03-30',
                startTime: '09:00',
                endTime: '17:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 30,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 36,
          totalDuration: 28,
          skillLevel: SkillLevelEnum.BEGINNER,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Business plan development',
            'Funding and investment strategies',
            'Marketing for startups',
            'Growth and scaling techniques',
          ],
          requirements: ['None'],
          targetAudience: [
            'Aspiring Entrepreneurs',
            'Startup Founders',
            'Business Owners',
          ],
          features: [
            'Business plan templates',
            'Funding guides',
            'Certificate',
          ],
        },
        price: 299.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
      {
        title: 'Change Management Strategies',
        slug: 'change-management-strategies',
        subtitle: 'Lead Organizational Change',
        description:
          'Learn to effectively lead and manage organizational change initiatives.',
        category: professionalDevCategoryId,
        hasTest: false,
        subcategories: ['Management'],
        topics: [
          'Change Leadership',
          'Change Planning',
          'Stakeholder Management',
          'Resistance',
        ],
        overview: 'Master change management for organizational transformation.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1551434678-e076c223a692',
        sessions: [
          {
            type: SessionFormatEnum.EVENING,
            timeBlocks: [
              {
                startDate: '2026-04-07',
                endDate: '2026-04-11',
                startTime: '18:00',
                endTime: '21:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 20,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 33,
          totalDuration: 26,
          skillLevel: SkillLevelEnum.ADVANCED,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'Change management frameworks',
            'Change planning and execution',
            'Stakeholder engagement',
            'Managing resistance to change',
          ],
          requirements: ['Management experience'],
          targetAudience: ['Change Managers', 'Senior Leaders', 'Consultants'],
          features: ['Change templates', 'Case studies', 'Certificate'],
        },
        price: 499.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: true,
        isBestseller: false,
      },
      {
        title: 'Quality Management Systems',
        slug: 'quality-management-systems',
        subtitle: 'ISO & Quality Standards',
        description:
          'Learn quality management systems, ISO standards, and quality assurance processes.',
        category: businessTrainingCategoryId,
        hasTest: false,
        subcategories: ['Operations'],
        topics: [
          'ISO Standards',
          'Quality Assurance',
          'Quality Control',
          'Auditing',
        ],
        overview: 'Comprehensive quality management training.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
        sessions: [
          {
            type: SessionFormatEnum.FULL_WEEK,
            timeBlocks: [
              {
                startDate: '2026-04-14',
                endDate: '2026-04-18',
                startTime: '09:00',
                endTime: '16:00',
                timeZone: 'Eastern Time (GMT-5)',
              },
            ],
            instructor: instructorId,
            location: locationId,
            seatsLeft: 16,
            mode: 'online',
          },
        ],
        snapshot: {
          totalLectures: 40,
          totalDuration: 32,
          skillLevel: SkillLevelEnum.INTERMEDIATE,
          language: 'English',
          enrolledStudents: 0,
          certificate: true,
          lifetimeAccess: true,
        },
        details: {
          whatYouWillLearn: [
            'ISO 9001 standards',
            'Quality management systems',
            'Quality control processes',
            'Internal auditing techniques',
          ],
          requirements: ['Quality experience helpful'],
          targetAudience: [
            'Quality Managers',
            'Auditors',
            'Operations Managers',
          ],
          features: ['ISO templates', 'Audit checklists', 'Certificate'],
        },
        price: 479.0,
        currency: CurrencyEnum.USD,
        isPublished: true,
        isFeatured: false,
        isBestseller: false,
      },
    ];

    // Create courses
    let createdCount = 0;
    let skippedCount = 0;

    for (const courseData of courses) {
      try {
        // Check if course already exists (findBySlug throws error if not found)
        let existing = null;
        try {
          existing = await coursesService.findBySlug(courseData.slug);
        } catch (error) {
          // Course doesn't exist, which is good - we can create it
          existing = null;
        }

        if (existing) {
          console.log(`⏭️  Skipped: ${courseData.title} (already exists)`);
          skippedCount++;
          continue;
        }

        // Create course (instructor is already in sessions, not at course level)
        const course = await coursesService.create(courseData as any);

        console.log(`✅ Created: ${course.title} (ID: ${course.id})`);
        createdCount++;
      } catch (error) {
        console.error(
          `❌ Failed to create: ${courseData.title}`,
          error.message || error,
        );
        console.error('   Error details:', {
          category: courseData.category,
          instructor: instructorId,
          error: error.message,
          errorStack: error.stack,
        });

        // If it's a category error, show more details
        if (
          error.message?.includes('Category') ||
          error.message?.includes('category')
        ) {
          console.error(
            '   Category validation failed. Category ID:',
            courseData.category,
          );
        }
      }
    }

    console.log('\n📊 Seeding Summary:');
    console.log(`   ✅ Created: ${createdCount} courses`);
    console.log(`   ⏭️  Skipped: ${skippedCount} courses`);
    console.log(`   📝 Total: ${courses.length} courses\n`);

    await app.close();
    console.log('✨ Course seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

void seedCourses();
