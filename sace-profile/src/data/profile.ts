// SACE Capability Profile — Student-facing data model
// Pilot 4, 2025 Capability Frameworks
//
// CRITICAL DESIGN CONSTRAINT: Students never see teacher ratings or criteria levels.
// An element is either "noticed" or it hasn't appeared yet. The experience is purely
// additive and celebratory. No scores, no levels, no progress bars, no comparisons.
//
// Data structure: Year 10 (1 subject) → Year 11 → Year 12, 2 semesters each.

export type Year = 10 | 11 | 12;
export type Semester = 1 | 2;

export interface Observation {
  subject: string;
  year: Year;
  semester: Semester;
}

// What the student sees: an element has been noticed, in these subjects, at these times.
// No criteria text, no levels. Binary: noticed or not.
export interface ObservedElement {
  element: string;
  observations: Observation[];
}

export interface Capability {
  name: string;
  color: string;
  colorLight: string;
  // Student-facing "I can..." statement — written in first person, warm, affirming
  statement: string;
  elements: ObservedElement[];
}

export interface StudentProfile {
  name: string;
  currentYear: Year;
  currentSemester: Semester;
  subjects: { name: string; year: Year; semesters: Semester[] }[];
  capabilities: Capability[];
}

// ─── Element ↔ Capability map ───────────────────────────────────────────────────
// All 21 elements and which capabilities they appear in.
// This is the bridge/connection data — when a student discovers an element appears
// in multiple capabilities, that's the delight moment.

export const ELEMENT_CAPABILITY_MAP: Record<string, string[]> = {
  "Adapting": ["Collective Engagement", "Communication", "Quality Thinking", "Self-motivated Learning"],
  "Being considerate and caring": ["Collective Engagement", "Principled Action"],
  "Demonstrating respect": ["Collective Engagement", "Communication", "Principled Action"],
  "Developing informed opinions": ["Collective Engagement", "Principled Action", "Quality Thinking"],
  "Embracing diversity": ["Collective Engagement", "Communication", "Principled Action"],
  "Engaging in dialogue": ["Collective Engagement", "Communication"],
  "Forming relationships": ["Collective Engagement", "Principled Action"],
  "Making contributions": ["Collective Engagement", "Personal Enterprise"],
  "Comprehending": ["Communication", "Quality Thinking"],
  "Engaging with feedback": ["Communication", "Quality Thinking", "Self-motivated Learning"],
  "Inquiring": ["Communication", "Quality Thinking"],
  "Using tools": ["Communication", "Personal Enterprise", "Self-motivated Learning"],
  "Being creative": ["Personal Enterprise", "Quality Thinking"],
  "Being curious": ["Personal Enterprise", "Quality Thinking"],
  "Being organised": ["Personal Enterprise", "Self-motivated Learning"],
  "Demonstrating initiative": ["Personal Enterprise", "Self-motivated Learning"],
  "Demonstrating perseverance": ["Personal Enterprise", "Self-motivated Learning"],
  "Taking opportunities": ["Personal Enterprise", "Self-motivated Learning"],
  "Being reflective": ["Principled Action", "Quality Thinking", "Self-motivated Learning"],
  "Being responsible": ["Principled Action", "Self-motivated Learning"],
  "Reasoning": ["Principled Action", "Quality Thinking"],
};

// ─── Anika's profile ────────────────────────────────────────────────────────────
// End of Year 11, Semester 2. She's been in SACE since Year 10.
// 1 subject in Year 10 (Research Project), 4 subjects in Year 11.

export const ANIKA_PROFILE: StudentProfile = {
  name: "Anika",
  currentYear: 11,
  currentSemester: 2,
  subjects: [
    { name: "Research Project", year: 10, semesters: [1, 2] },
    { name: "English", year: 11, semesters: [1, 2] },
    { name: "Biology", year: 11, semesters: [1, 2] },
    { name: "Drama", year: 11, semesters: [1, 2] },
    { name: "Modern History", year: 11, semesters: [1, 2] },
  ],
  capabilities: [
    {
      name: "Communication",
      color: "#C17F24",
      colorLight: "#F5DEB3",
      statement: "I can communicate to enhance relationships, shape understanding and build connections.",
      elements: [
        {
          element: "Adapting",
          observations: [
            { subject: "English", year: 11, semester: 1 },
            { subject: "Drama", year: 11, semester: 1 },
            { subject: "English", year: 11, semester: 2 },
          ],
        },
        {
          element: "Comprehending",
          observations: [
            { subject: "English", year: 11, semester: 1 },
            { subject: "Biology", year: 11, semester: 1 },
          ],
        },
        {
          element: "Demonstrating respect",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Embracing diversity",
          observations: [
            { subject: "Drama", year: 11, semester: 2 },
          ],
        },
        {
          element: "Engaging in dialogue",
          observations: [
            { subject: "English", year: 11, semester: 1 },
            { subject: "Drama", year: 11, semester: 1 },
            { subject: "Drama", year: 11, semester: 2 },
            { subject: "Modern History", year: 11, semester: 2 },
          ],
        },
        {
          element: "Engaging with feedback",
          observations: [
            { subject: "English", year: 11, semester: 2 },
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Inquiring",
          observations: [
            { subject: "English", year: 11, semester: 1 },
            { subject: "Modern History", year: 11, semester: 2 },
          ],
        },
        {
          element: "Using tools",
          observations: [
            { subject: "Biology", year: 11, semester: 1 },
          ],
        },
      ],
    },
    {
      name: "Quality Thinking",
      color: "#1A7A6D",
      colorLight: "#B2DFDB",
      statement: "I am curious about the world around me and use a range of thinking strategies to shape my understanding.",
      elements: [
        {
          element: "Adapting",
          observations: [
            { subject: "Modern History", year: 11, semester: 1 },
            { subject: "Biology", year: 11, semester: 2 },
          ],
        },
        {
          element: "Being creative",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Being curious",
          observations: [
            { subject: "Modern History", year: 11, semester: 2 },
            { subject: "Biology", year: 11, semester: 1 },
            { subject: "Research Project", year: 10, semester: 2 },
          ],
        },
        {
          element: "Being reflective",
          observations: [
            { subject: "English", year: 11, semester: 2 },
            { subject: "Research Project", year: 10, semester: 2 },
          ],
        },
        {
          element: "Comprehending",
          observations: [
            { subject: "English", year: 11, semester: 1 },
            { subject: "Biology", year: 11, semester: 2 },
          ],
        },
        {
          element: "Developing informed opinions",
          observations: [
            { subject: "Modern History", year: 11, semester: 2 },
            { subject: "English", year: 11, semester: 2 },
          ],
        },
        {
          element: "Engaging with feedback",
          observations: [
            { subject: "English", year: 11, semester: 2 },
          ],
        },
        {
          element: "Inquiring",
          observations: [
            { subject: "Modern History", year: 11, semester: 1 },
            { subject: "Biology", year: 11, semester: 2 },
            { subject: "Research Project", year: 10, semester: 1 },
          ],
        },
        {
          element: "Reasoning",
          observations: [
            { subject: "Modern History", year: 11, semester: 2 },
            { subject: "Biology", year: 11, semester: 2 },
          ],
        },
      ],
    },
    {
      name: "Collective Engagement",
      color: "#B85C38",
      colorLight: "#FFCCBC",
      statement: "I can be inclusive of ideas, people, and perspectives to generate purposeful outcomes.",
      elements: [
        {
          element: "Adapting",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Being considerate and caring",
          observations: [
            { subject: "Drama", year: 11, semester: 2 },
          ],
        },
        {
          element: "Demonstrating respect",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
            { subject: "Modern History", year: 11, semester: 2 },
          ],
        },
        {
          element: "Developing informed opinions",
          observations: [
            { subject: "Modern History", year: 11, semester: 2 },
          ],
        },
        {
          element: "Embracing diversity",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Engaging in dialogue",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
            { subject: "English", year: 11, semester: 2 },
          ],
        },
        {
          element: "Forming relationships",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Making contributions",
          observations: [
            { subject: "English", year: 11, semester: 1 },
            { subject: "Drama", year: 11, semester: 2 },
          ],
        },
      ],
    },
    {
      name: "Personal Enterprise",
      color: "#C47030",
      colorLight: "#FFE0B2",
      statement: "I can demonstrate initiative, pursue opportunities, produce outcomes of value, and get things done.",
      elements: [
        {
          element: "Being creative",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Being curious",
          observations: [
            { subject: "Biology", year: 11, semester: 1 },
            { subject: "Research Project", year: 10, semester: 1 },
          ],
        },
        {
          element: "Being organised",
          observations: [
            { subject: "Biology", year: 11, semester: 1 },
            { subject: "English", year: 11, semester: 1 },
          ],
        },
        {
          element: "Demonstrating initiative",
          observations: [
            { subject: "Drama", year: 11, semester: 2 },
            { subject: "Research Project", year: 10, semester: 2 },
          ],
        },
        {
          element: "Demonstrating perseverance",
          observations: [
            { subject: "English", year: 11, semester: 2 },
          ],
        },
        {
          element: "Making contributions",
          observations: [
            { subject: "English", year: 11, semester: 1 },
          ],
        },
        {
          element: "Taking opportunities",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Using tools",
          observations: [
            { subject: "Biology", year: 11, semester: 1 },
          ],
        },
      ],
    },
    {
      name: "Principled Action",
      color: "#5E8B60",
      colorLight: "#C8E6C9",
      statement: "I can be responsible for my actions and consider the impact I have on others and the world around me.",
      elements: [
        {
          element: "Being considerate and caring",
          observations: [
            { subject: "Drama", year: 11, semester: 2 },
          ],
        },
        {
          element: "Being reflective",
          observations: [
            { subject: "English", year: 11, semester: 2 },
          ],
        },
        {
          element: "Being responsible",
          observations: [
            { subject: "English", year: 11, semester: 1 },
          ],
        },
        {
          element: "Demonstrating respect",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Developing informed opinions",
          observations: [
            { subject: "Modern History", year: 11, semester: 2 },
          ],
        },
        {
          element: "Embracing diversity",
          observations: [], // Not yet observed — but NOT shown to student
        },
        {
          element: "Forming relationships",
          observations: [
            { subject: "Drama", year: 11, semester: 1 },
          ],
        },
        {
          element: "Reasoning",
          observations: [
            { subject: "Modern History", year: 11, semester: 2 },
          ],
        },
      ],
    },
    {
      name: "Self-motivated Learning",
      color: "#7E6B8F",
      colorLight: "#E1BEE7",
      statement: "I can embrace challenges as opportunities and persevere and be active in my own learning.",
      elements: [
        {
          element: "Adapting",
          observations: [
            { subject: "Biology", year: 11, semester: 1 },
          ],
        },
        {
          element: "Being organised",
          observations: [
            { subject: "English", year: 11, semester: 1 },
          ],
        },
        {
          element: "Being reflective",
          observations: [
            { subject: "English", year: 11, semester: 2 },
          ],
        },
        {
          element: "Being responsible",
          observations: [
            { subject: "English", year: 11, semester: 1 },
            { subject: "Biology", year: 11, semester: 2 },
          ],
        },
        {
          element: "Demonstrating initiative",
          observations: [
            { subject: "Modern History", year: 11, semester: 2 },
          ],
        },
        {
          element: "Demonstrating perseverance",
          observations: [
            { subject: "English", year: 11, semester: 2 },
          ],
        },
        {
          element: "Engaging with feedback",
          observations: [
            { subject: "English", year: 11, semester: 2 },
          ],
        },
        {
          element: "Taking opportunities",
          observations: [], // Not yet observed
        },
        {
          element: "Using tools",
          observations: [
            { subject: "Biology", year: 11, semester: 1 },
          ],
        },
      ],
    },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

// Get unique subjects where an element has been noticed
export function getElementSubjects(el: ObservedElement): string[] {
  return [...new Set(el.observations.map((o) => o.subject))];
}

// Is this element observed at all?
export function isObserved(el: ObservedElement): boolean {
  return el.observations.length > 0;
}

// Get capability stats — only counts observed elements, no levels
export function getCapabilityStats(cap: Capability) {
  const total = cap.elements.length;
  const observed = cap.elements.filter((e) => e.observations.length > 0).length;
  return { total, observed };
}

// Get all distinct observed elements across the profile (for brick generation)
export function getAllObservedElements(profile: StudentProfile): {
  element: string;
  subjects: string[];
  capabilities: string[];
  capabilityColors: string[];
  firstSeen: { year: Year; semester: Semester };
  observationCount: number;
}[] {
  const elementMap = new Map<string, {
    subjects: Set<string>;
    capabilities: Set<string>;
    capabilityColors: string[];
    firstYear: Year;
    firstSemester: Semester;
    count: number;
  }>();

  for (const cap of profile.capabilities) {
    for (const el of cap.elements) {
      if (el.observations.length === 0) continue;

      const existing = elementMap.get(el.element);
      if (existing) {
        el.observations.forEach((o) => existing.subjects.add(o.subject));
        existing.capabilities.add(cap.name);
        if (!existing.capabilityColors.includes(cap.color)) {
          existing.capabilityColors.push(cap.color);
        }
        existing.count += el.observations.length;
        // Update first seen
        for (const o of el.observations) {
          if (o.year < existing.firstYear || (o.year === existing.firstYear && o.semester < existing.firstSemester)) {
            existing.firstYear = o.year;
            existing.firstSemester = o.semester;
          }
        }
      } else {
        const firstObs = el.observations.reduce((earliest, o) => {
          if (o.year < earliest.year || (o.year === earliest.year && o.semester < earliest.semester)) return o;
          return earliest;
        }, el.observations[0]);

        elementMap.set(el.element, {
          subjects: new Set(el.observations.map((o) => o.subject)),
          capabilities: new Set([cap.name]),
          capabilityColors: [cap.color],
          firstYear: firstObs.year,
          firstSemester: firstObs.semester,
          count: el.observations.length,
        });
      }
    }
  }

  return Array.from(elementMap.entries()).map(([element, data]) => ({
    element,
    subjects: Array.from(data.subjects),
    capabilities: Array.from(data.capabilities),
    capabilityColors: data.capabilityColors,
    firstSeen: { year: data.firstYear, semester: data.firstSemester },
    observationCount: data.count,
  }));
}
