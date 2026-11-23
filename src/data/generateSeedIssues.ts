import {
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  WorkReport,
  CitizenFeedback,
  IssueTimelineEvent,
  IssueNote,
} from '../types';
import { SAMPLE_LOCATIONS } from './sampleLocations';
import { SEED_MAINTENANCE_STAFF } from './maintenanceStaff';

interface IssueTemplate {
  title: string;
  description: string;
  category: IssueCategory;
  deptId: string;
  deptName: string;
  photoUrl: string;
  resolvedPhotoUrl: string;
  hoursSpent: number;
  materials: string[];
  equipment: string[];
}

const TEMPLATES: Record<string, IssueTemplate[]> = {
  ROAD_DAMAGE: [
    {
      title: 'Deep Asphalt Pothole on Multi-Lane Arterial',
      description: 'Vehicles forced to swerve abruptly into adjacent lanes to avoid wheel and suspension damage. Sub-base aggregate exposed.',
      category: 'ROAD_DAMAGE',
      deptId: 'dept-roads',
      deptName: 'Road Damage & Pavements',
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1578965762804-0c8f10dd18fa?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 3.5,
      materials: ['Hot-mix asphalt 1.2 tons', 'Tack coat emulsified bitumen', 'Compacted base gravel'],
      equipment: ['Vibratory roller', 'Asphalt cutter', 'Thermal infill compactor'],
    },
    {
      title: 'Fissured Road Sub-Base and Longitudinal Cracks',
      description: 'Multiple longitudinal road fissures expanding after heavy frost and rainwater penetration. Threatens lane integrity.',
      category: 'ROAD_DAMAGE',
      deptId: 'dept-roads',
      deptName: 'Road Damage & Pavements',
      photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1578965762804-0c8f10dd18fa?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 4.0,
      materials: ['Polymer-modified joint sealant', 'Bituminous binder', 'Fine crushed stone'],
      equipment: ['Hot-pour crack seal applicator', 'Pneumatic air lance'],
    },
    {
      title: 'Collapsed Highway Divider Curb and Barrier Damage',
      description: 'Vehicle impact knocked down 8 meters of concrete center divider, leaving fragments scattered across the inner fast lane.',
      category: 'ROAD_DAMAGE',
      deptId: 'dept-roads',
      deptName: 'Road Damage & Pavements',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1578965762804-0c8f10dd18fa?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 5.5,
      materials: ['Precast concrete barrier segment', 'Rebar anchors', 'Non-shrink epoxy grout'],
      equipment: ['Boom truck crane', 'Heavy hammer drill', 'Torque wrench set'],
    },
  ],
  STREETLIGHT: [
    {
      title: 'Blackout of Consecutive Streetlight Luminaires',
      description: 'Three consecutive overhead LED luminaires dark since weekend storm. Zero nighttime visibility for pedestrians and vehicles.',
      category: 'STREETLIGHT',
      deptId: 'dept-lighting',
      deptName: 'Streetlight & Electrical Grid',
      photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 2.0,
      materials: ['150W Modular LED Streetlight Head', 'IP67 Photocell Switch', 'Armored 12AWG Cable'],
      equipment: ['Insulated aerial bucket truck', 'Digital clamp multimeter', 'Torque crimper'],
    },
    {
      title: 'Exposed High-Voltage Electrical Junction Box at Base',
      description: 'Inspection cover rusted open, exposing live 240V wire terminals within reach of children and pets on the public sidewalk.',
      category: 'STREETLIGHT',
      deptId: 'dept-lighting',
      deptName: 'Streetlight & Electrical Grid',
      photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 1.5,
      materials: ['Vandal-proof junction cover', 'Waterproof gel splice connectors', 'Security star screws'],
      equipment: ['Megohmmeter insulation tester', 'Lockout-tagout kit'],
    },
    {
      title: 'Flickering High-Mast Highway Floodlight Array',
      description: 'Highway exit ramp illumination strobing intermittently causing driver disorientation during rain.',
      category: 'STREETLIGHT',
      deptId: 'dept-lighting',
      deptName: 'Streetlight & Electrical Grid',
      photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 2.5,
      materials: ['Constant current LED driver unit', 'Surge protection module 20kV'],
      equipment: ['High-mast winch lowering gear', 'Voltage logger'],
    },
  ],
  DRAINAGE: [
    {
      title: 'Flooded Road Intersection Due to Choked Catch Basin',
      description: 'Storm drain clogged with compacted autumn leaves and construction silt. Standing water 15cm deep spilling into retail storefronts.',
      category: 'DRAINAGE',
      deptId: 'dept-water',
      deptName: 'Drainage & Stormwater',
      photoUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 3.0,
      materials: ['Heavy-duty ductile iron replacement grate', 'Bio-degradable pipe degreaser'],
      equipment: ['High-pressure hydro-jetting truck', 'Industrial vacuum trailer'],
    },
    {
      title: 'Subterranean Storm Culvert Structural Collapse',
      description: 'Sinkhole depression forming over 450mm corrugated stormwater conduit. Ground sagging noticeably near bus stop foundation.',
      category: 'DRAINAGE',
      deptId: 'dept-water',
      deptName: 'Drainage & Stormwater',
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 6.0,
      materials: ['Reinforced concrete pipe sleeve 450mm', 'Geotextile fabric', 'Structural backfill gravel'],
      equipment: ['Compact excavator', 'Trench shoring box', 'Plate tamper'],
    },
    {
      title: 'Dislodged Heavy Manhole Cover Clattering Under Traffic',
      description: 'Cast iron sewer manhole lid misaligned and rocking when cars pass, posing catastrophic rim flip and tire blowout hazard.',
      category: 'DRAINAGE',
      deptId: 'dept-water',
      deptName: 'Drainage & Stormwater',
      photoUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 2.0,
      materials: ['Machined elastomer seating gasket', 'Fast-setting hydraulic cement'],
      equipment: ['Magnetic manhole lifter', 'Concrete scarifier'],
    },
  ],
  FOOTPATH: [
    {
      title: 'Severe Tree Root Lift Upheaval on Concrete Sidewalk',
      description: 'Sidewalk slab displaced upward by 8 cm, creating a severe trip hazard for elderly pedestrians and completely blocking wheelchairs.',
      category: 'FOOTPATH',
      deptId: 'dept-footpaths',
      deptName: 'Footpath & Sidewalk Safety',
      photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1578965762804-0c8f10dd18fa?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 4.5,
      materials: ['Polymer concrete mix', 'Root barrier shield', 'Expansion joint foam'],
      equipment: ['Concrete diamond saw', 'Hydraulic jackhammer', 'Plate compactor'],
    },
    {
      title: 'Crumbled Pedestrian Curb Ramp at School Crosswalk',
      description: 'ADA curb transition crumbled and fragmented. Wheelchair users cannot safely transition into designated crosswalk lane.',
      category: 'FOOTPATH',
      deptId: 'dept-footpaths',
      deptName: 'Footpath & Sidewalk Safety',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1578965762804-0c8f10dd18fa?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 3.5,
      materials: ['Yellow truncated dome tactile pavers', 'High-strength quick-cure concrete'],
      equipment: ['Concrete bull float', 'Edging trowel', 'Formwork wood bracing'],
    },
    {
      title: 'Sunken Brick Pavers Forming Stagnant Mud Ponding',
      description: 'Historical decorative promenade pavers sunken 6cm below grade. Pedestrians forced into busy traffic lane to avoid deep mud puddle.',
      category: 'FOOTPATH',
      deptId: 'dept-footpaths',
      deptName: 'Footpath & Sidewalk Safety',
      photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1578965762804-0c8f10dd18fa?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 3.0,
      materials: ['Granular leveling sand', 'Polymeric joint sand', 'Interlocking replacement pavers'],
      equipment: ['Rubber mallet', 'Plate compactor with rubber mat'],
    },
  ],
  WASTE: [
    {
      title: 'Illegal Chemical Barrel Dumping in Service Alley',
      description: 'Four rusted 55-gallon drums left adjacent to storm runoff canal with pungent chemical odor detected by nearby residents.',
      category: 'WASTE',
      deptId: 'dept-waste',
      deptName: 'Waste Management & Cleanliness',
      photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 4.0,
      materials: ['Hazmat overpack containment drums', 'Neutralizing absorbent pads', 'Warning placards'],
      equipment: ['Drum lifter claw', 'PID photoionization detector', 'Enclosed hazmat flatbed truck'],
    },
    {
      title: 'Commercial Waste Dumpster Overflow and Rodent Activity',
      description: 'Public alley overflowing with uncontained restaurant waste bags torn open across 30 meters of roadway with strong odor.',
      category: 'WASTE',
      deptId: 'dept-waste',
      deptName: 'Waste Management & Cleanliness',
      photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 2.5,
      materials: ['Hospital-grade disinfectant spray', 'Heavy-duty 4-mil waste sacks'],
      equipment: ['Automated rear-loader refuse compactor', 'High-pressure thermal sanitizer wand'],
    },
    {
      title: 'Construction Drywall and Asbestos Debris Abandoned on Verge',
      description: 'Demolition waste dumped overnight on city road verge near residential park perimeter.',
      category: 'WASTE',
      deptId: 'dept-waste',
      deptName: 'Waste Management & Cleanliness',
      photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 3.5,
      materials: ['6-mil labeled asbestos waste bags', 'Encapsulation sealant spray'],
      equipment: ['HEPA vacuum unit', 'Enclosed skip bin transport'],
    },
  ],
  PUBLIC_INFRA: [
    {
      title: 'Shattered Tempered Glass Panels on Transit Bus Shelter',
      description: 'Vandals smashed two protective tempered glass side screens. Glass shards strewn across bench seating and transit waiting zone.',
      category: 'PUBLIC_INFRA',
      deptId: 'dept-public-infra',
      deptName: 'Public Infrastructure & Structures',
      photoUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 3.0,
      materials: ['10mm laminated safety polycarbonate panels', 'Tamper-resistant security Torx bolts'],
      equipment: ['Glass suction vacuum grippers', 'Torque impact driver', 'Shop vacuum'],
    },
    {
      title: 'Corroded Pedestrian Footbridge Safety Guardrail',
      description: 'Railing welds rusted through above active roadway. Pedestrians leaning on railing risk catastrophic structural failure.',
      category: 'PUBLIC_INFRA',
      deptId: 'dept-public-infra',
      deptName: 'Public Infrastructure & Structures',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 4.5,
      materials: ['Structural galvanized steel angle bar', 'Zinc-rich primer coat', 'Epoxy marine enamel'],
      equipment: ['Portable MIG welder', 'Angle grinder with wire cup', 'Harness fall arrest system'],
    },
    {
      title: 'Cracked Retaining Wall Tilting Toward Public Pathway',
      description: 'Ground heave has caused 15-meter stone gravity retaining wall to bow outward by 12 degrees. Soil spillage observed.',
      category: 'PUBLIC_INFRA',
      deptId: 'dept-public-infra',
      deptName: 'Public Infrastructure & Structures',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      resolvedPhotoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      hoursSpent: 6.0,
      materials: ['Helical tieback ground anchors', 'Precast concrete crib blocks', 'Geotextile drainage sock'],
      equipment: ['Hydraulic rotary anchor drill', 'Tension calibration gauge'],
    },
  ],
};

TEMPLATES.WASTE_MANAGEMENT = TEMPLATES.WASTE;
TEMPLATES.PUBLIC_INFRASTRUCTURE = TEMPLATES.PUBLIC_INFRA;

const CITIZEN_NAMES = [
  'Sophia Al-Mansoor', 'David Kim', 'Elena Rostova', 'Amara Okafor', 'Marco Rossi',
  'Chloe Dubois', 'Liam Gallagher', 'Hannah Abbott', 'Priya Sharma', 'Lucas Sterling',
  'Jamal Washington', 'Isabella Garcia', 'Viktor Dragan', 'Noah Bennett', 'Aisha Bello'
];

const PRIORITIES: IssuePriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: IssueStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export function generateAllSeedIssues(): Issue[] {
  const issues: Issue[] = [];
  const categories: IssueCategory[] = ['ROAD_DAMAGE', 'STREETLIGHT', 'DRAINAGE', 'FOOTPATH', 'WASTE', 'PUBLIC_INFRA'];

  let ticketCounter = 8100;
  let issueIndex = 0;

  // Generate 18 issues per category = 108 issues total!
  for (const cat of categories) {
    const templates = TEMPLATES[cat];
    
    for (let i = 0; i < 18; i++) {
      ticketCounter++;
      issueIndex++;

      const template = templates[i % templates.length];
      const location = SAMPLE_LOCATIONS[(issueIndex + i) % SAMPLE_LOCATIONS.length];
      const citizenName = CITIZEN_NAMES[(issueIndex * 3 + i) % CITIZEN_NAMES.length];
      const citizenEmail = `${citizenName.toLowerCase().replace(/[\s-]/g, '.')}@example.com`;
      const citizenPhone = `+1 (555) 019-${(1000 + issueIndex).toString().substring(1)}`;

      // Status distribution
      // 0-2: SUBMITTED (3)
      // 3-5: UNDER_REVIEW (3)
      // 6-8: ASSIGNED (3)
      // 9-11: IN_PROGRESS (3)
      // 12-15: RESOLVED (4)
      // 16-17: CLOSED (2)
      let status: IssueStatus;
      if (i < 3) status = 'SUBMITTED';
      else if (i < 6) status = 'UNDER_REVIEW';
      else if (i < 9) status = 'ASSIGNED';
      else if (i < 12) status = 'IN_PROGRESS';
      else if (i < 16) status = 'RESOLVED';
      else status = 'CLOSED';

      const priority = PRIORITIES[(i + (cat.length % 4)) % PRIORITIES.length];

      // Relevant department staff
      const deptStaff = SEED_MAINTENANCE_STAFF.filter((s) => s.departmentId === template.deptId);
      const assignedStaff = deptStaff[i % deptStaff.length];

      // Dynamic timestamps
      const createdDaysAgo = Math.max(1, 28 - Math.floor(issueIndex / 4));
      const createdDate = new Date(Date.now() - createdDaysAgo * 24 * 3600 * 1000 + (i * 3600 * 1000));
      const createdAt = createdDate.toISOString();
      const slaDeadline = new Date(createdDate.getTime() + 48 * 3600 * 1000).toISOString();

      const timeline: IssueTimelineEvent[] = [
        {
          id: `tl-${ticketCounter}-1`,
          status: 'SUBMITTED',
          title: 'Citizen Report Lodged',
          description: `Problem identified and reported with GPS verification at ${location.address}.`,
          actorName: citizenName,
          actorRole: 'CITIZEN',
          actorId: `usr-cit-${issueIndex}`,
          timestamp: createdAt,
        },
      ];

      let verifiedAt: string | undefined;
      let verifiedBy: string | undefined;
      let assignedStaffId: string | undefined;
      let assignedStaffName: string | undefined;
      let resolvedAt: string | undefined;
      let closedAt: string | undefined;
      let workReport: WorkReport | undefined;
      let feedback: CitizenFeedback | undefined;

      const notes: IssueNote[] = [
        {
          id: `note-${ticketCounter}-init`,
          authorName: citizenName,
          authorRole: 'CITIZEN',
          authorId: `usr-cit-${issueIndex}`,
          content: `Observed near ${location.landmark}. Requesting urgent inspection.`,
          isInternal: false,
          createdAt: createdAt,
        },
      ];

      if (status !== 'SUBMITTED') {
        const reviewDate = new Date(createdDate.getTime() + 2 * 3600 * 1000);
        verifiedAt = reviewDate.toISOString();
        verifiedBy = 'Marcus Brody';
        timeline.push({
          id: `tl-${ticketCounter}-2`,
          status: 'UNDER_REVIEW',
          title: 'Department Intake Verification',
          description: `Verified by Department Manager. Priority assigned as ${priority}.`,
          actorName: 'Marcus Brody',
          actorRole: 'DEPARTMENT_MANAGER',
          actorId: 'usr-mgr-roads',
          timestamp: verifiedAt,
        });
      }

      if (status === 'ASSIGNED' || status === 'IN_PROGRESS' || status === 'RESOLVED' || status === 'CLOSED') {
        const assignDate = new Date(createdDate.getTime() + 5 * 3600 * 1000);
        assignedStaffId = assignedStaff.id;
        assignedStaffName = assignedStaff.name;
        timeline.push({
          id: `tl-${ticketCounter}-3`,
          status: 'ASSIGNED',
          title: 'Field Work Order Dispatched',
          description: `Assigned to technician ${assignedStaff.name} with vehicle dispatch order.`,
          actorName: 'Marcus Brody',
          actorRole: 'DEPARTMENT_MANAGER',
          actorId: 'usr-mgr-roads',
          timestamp: assignDate.toISOString(),
        });
      }

      if (status === 'IN_PROGRESS' || status === 'RESOLVED' || status === 'CLOSED') {
        const progressDate = new Date(createdDate.getTime() + 10 * 3600 * 1000);
        timeline.push({
          id: `tl-${ticketCounter}-4`,
          status: 'IN_PROGRESS',
          title: 'Field Crew On-Site',
          description: `${assignedStaff.name} arrived at site. Equipment deployed and safety perimeter established.`,
          actorName: assignedStaff.name,
          actorRole: 'MAINTENANCE_STAFF',
          actorId: assignedStaff.id,
          timestamp: progressDate.toISOString(),
        });
        notes.push({
          id: `note-${ticketCounter}-crew`,
          authorName: assignedStaff.name,
          authorRole: 'MAINTENANCE_STAFF',
          authorId: assignedStaff.id,
          content: 'Work zone secured with safety cones. Initiating repairs.',
          isInternal: true,
          createdAt: progressDate.toISOString(),
        });
      }

      if (status === 'RESOLVED' || status === 'CLOSED') {
        const resolveDate = new Date(createdDate.getTime() + 18 * 3600 * 1000);
        resolvedAt = resolveDate.toISOString();
        timeline.push({
          id: `tl-${ticketCounter}-5`,
          status: 'RESOLVED',
          title: 'Repairs Completed & Tested',
          description: `Field maintenance completed by ${assignedStaff.name}. Proof photograph uploaded and site cleared.`,
          actorName: assignedStaff.name,
          actorRole: 'MAINTENANCE_STAFF',
          actorId: assignedStaff.id,
          timestamp: resolvedAt,
        });

        workReport = {
          completedAt: resolvedAt,
          staffId: assignedStaff.id,
          staffName: assignedStaff.name,
          completionPhotoUrls: [template.resolvedPhotoUrl],
          notes: `Work completed in accordance with municipal structural standards. Tested and verified clean.`,
          summary: `Work completed in accordance with municipal structural standards. Tested and verified clean.`,
          hoursSpent: template.hoursSpent,
          laborHours: template.hoursSpent,
          costEstimate: Math.round(template.hoursSpent * 65 + 120),
          rootCause: 'Environmental weathering, moisture intrusion, and surface fatigue.',
          materialsUsed: template.materials,
          partsUsed: template.materials,
          equipmentUsed: template.equipment,
          submittedAt: resolvedAt,
        };

        const rating = Math.min(5, Math.max(3, 5 - (i % 3)));
        feedback = {
          rating,
          comment: rating === 5
            ? 'Incredible turnaround! The crew was professional and cleaned up the site perfectly.'
            : 'Issue is fixed and safe now. Thank you for addressing this quickly.',
          citizenName,
          citizenId: `usr-cit-${issueIndex}`,
          submittedAt: new Date(new Date(resolvedAt).getTime() + 2 * 3600 * 1000).toISOString(),
          satisfactionScore: rating * 20,
        };
      }

      if (status === 'CLOSED') {
        const closeDate = new Date(createdDate.getTime() + 24 * 3600 * 1000);
        closedAt = closeDate.toISOString();
        timeline.push({
          id: `tl-${ticketCounter}-6`,
          status: 'CLOSED',
          title: 'Case Officially Closed',
          description: 'Citizen satisfaction confirmed and supervisory sign-off archived into municipal registry.',
          actorName: 'Eleanor Vance',
          actorRole: 'ADMIN',
          actorId: 'usr-admin-1',
          timestamp: closedAt,
        });
      }

      const issue: Issue = {
        id: `CP-${ticketCounter}`,
        ticketNumber: `CP-${ticketCounter}`,
        title: `${template.title} (#${i + 1})`,
        description: `${template.description} Located near ${location.landmark}.`,
        category: template.category,
        departmentId: template.deptId,
        departmentName: template.deptName,
        priority,
        status,
        location: {
          address: location.address,
          landmark: location.landmark,
          lat: location.lat + (Math.sin(i * 1.5) * 0.0015),
          lng: location.lng + (Math.cos(i * 1.5) * 0.0015),
          cityZone: location.cityZone,
        },
        photoUrls: [template.photoUrl],
        completionPhotos: (status === 'RESOLVED' || status === 'CLOSED') ? [template.resolvedPhotoUrl] : [],
        citizenId: `usr-cit-${issueIndex}`,
        citizenName,
        citizenEmail,
        citizenPhone,
        assignedStaffId,
        assignedStaffName,
        createdAt,
        updatedAt: closedAt || resolvedAt || createdAt,
        verifiedAt,
        verifiedBy,
        resolvedAt,
        closedAt,
        slaDeadline,
        isSlaBreached: false,
        timeline,
        workReport,
        feedback,
        notes,
        upvotes: Math.floor(Math.sin(i * 3 + issueIndex) * 12) + 14,
        upvotedBy: [],
        isEmergency: priority === 'CRITICAL',
      };

      issues.push(issue);
    }
  }

  return issues;
}
