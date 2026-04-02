// Skill Recipes — when these elements are stacked together, a skill is revealed.
//
// Design principles:
// - Skills are emergent. The name should surprise and delight, not categorize.
// - Each skill needs a minimum of 3 matching elements to form.
// - Elements can appear in multiple recipes (a student discovers the same brick
//   contributes to different skills — that's a second-order aha moment).
// - Skill names should be things a 17-year-old would put in their Instagram bio,
//   share with friends, or mention in a job interview.

export interface SkillRecipe {
  name: string;
  // What the student sees when the skill is revealed — warm, affirming, identity-forming
  description: string;
  // The elements that combine to form this skill
  elements: string[];
  // Minimum elements from the recipe needed to trigger the reveal (allows partial matches)
  minMatch: number;
  // Colour for the formed skill block
  color: string;
}

export const SKILL_RECIPES: SkillRecipe[] = [
  {
    name: "Storytelling",
    description:
      "You take ideas and shape them so others can feel them. You read the room, find the right words, and help things land.",
    elements: ["Being creative", "Comprehending", "Adapting", "Using tools"],
    minMatch: 3,
    color: "#E07A5F",
  },
  {
    name: "Critical Analysis",
    description:
      "You don't just accept what you're told. You ask why, look at the evidence, and form your own view.",
    elements: ["Inquiring", "Reasoning", "Developing informed opinions", "Being curious"],
    minMatch: 3,
    color: "#3D5A80",
  },
  {
    name: "Collaboration",
    description:
      "Something shifts when you're part of a group. You listen, contribute, and adjust so everyone has room to do their best.",
    elements: ["Engaging in dialogue", "Making contributions", "Demonstrating respect", "Adapting"],
    minMatch: 3,
    color: "#E76F51",
  },
  {
    name: "Empathy",
    description:
      "You notice how people feel and what they need. You make space for others — especially when it's not easy.",
    elements: [
      "Being considerate and caring",
      "Embracing diversity",
      "Demonstrating respect",
      "Forming relationships",
    ],
    minMatch: 3,
    color: "#D4A373",
  },
  {
    name: "Resilience",
    description:
      "You keep going when things get hard. Not because you ignore difficulty — because you adapt and find a way through.",
    elements: ["Demonstrating perseverance", "Being reflective", "Adapting", "Being responsible"],
    minMatch: 3,
    color: "#6B705C",
  },
  {
    name: "Innovation",
    description:
      "You see possibilities that aren't obvious. You try things, take risks, and make something new.",
    elements: ["Being creative", "Being curious", "Taking opportunities", "Demonstrating initiative"],
    minMatch: 3,
    color: "#9B5DE5",
  },
  {
    name: "Self-Direction",
    description:
      "You own your own learning. You organise yourself, seek feedback, and reflect on what's working.",
    elements: ["Being organised", "Being reflective", "Engaging with feedback", "Being responsible"],
    minMatch: 3,
    color: "#00BBF9",
  },
  {
    name: "Advocacy",
    description:
      "Views are forming. You ask questions, speak up, and don't shy away from perspectives different from your own.",
    elements: [
      "Developing informed opinions",
      "Engaging in dialogue",
      "Reasoning",
      "Embracing diversity",
    ],
    minMatch: 3,
    color: "#F15BB5",
  },
  {
    name: "Problem Solving",
    description:
      "You break things down, try different angles, and use whatever tools you can find to figure it out.",
    elements: ["Reasoning", "Adapting", "Inquiring", "Using tools"],
    minMatch: 3,
    color: "#FEE440",
  },
  {
    name: "Leadership",
    description:
      "You step up — not to be in charge, but to help things move forward. You bring people with you.",
    elements: [
      "Demonstrating initiative",
      "Engaging in dialogue",
      "Forming relationships",
      "Making contributions",
    ],
    minMatch: 3,
    color: "#2EC4B6",
  },
];

// ─── Surprise capabilities ──────────────────────────────────────────────────────
// Pleasant surprises — capabilities that emerge from specific skill combos,
// outside the 6 SACE capabilities. These are the "aha" moments.

export interface SurpriseCapability {
  name: string;
  description: string;
  requiredSkills: string[];
  color: string;
}

export const SURPRISE_CAPABILITIES: SurpriseCapability[] = [
  // ── Storytelling pairs ──────────────────────────────────────────────────────
  {
    name: "Adaptive Communication",
    description:
      "You read the room and adjust. Ideas tend to land better when you're the one helping to shape them.",
    requiredSkills: ["Storytelling", "Collaboration"],
    color: "#FF9F43",
  },
  {
    name: "Grounded Expression",
    description:
      "Ideas that have both shape and substance. Something here doesn't just find the words — it finds the thinking behind them.",
    requiredSkills: ["Storytelling", "Critical Analysis"],
    color: "#E64A19",
  },
  {
    name: "Human Resonance",
    description:
      "When understanding people comes before saying anything, something shifts in how ideas reach them.",
    requiredSkills: ["Storytelling", "Empathy"],
    color: "#00897B",
  },
  {
    name: "Enduring Voice",
    description:
      "The expression keeps going even when things get difficult. Something here keeps finding ways to say what needs to be said.",
    requiredSkills: ["Storytelling", "Resilience"],
    color: "#7B1FA2",
  },
  {
    name: "Imaginative Expression",
    description:
      "New forms for new ideas. Something here is willing to try saying things in ways that haven't been tried before.",
    requiredSkills: ["Storytelling", "Innovation"],
    color: "#4527A0",
  },
  {
    name: "Intentional Expression",
    description:
      "A developing sense of why it matters to say things well — and the discipline to do the work of saying them.",
    requiredSkills: ["Storytelling", "Self-Direction"],
    color: "#1B5E20",
  },
  {
    name: "Voice with Purpose",
    description:
      "A story that also makes a case. When something matters, the words seem to find their way.",
    requiredSkills: ["Storytelling", "Advocacy"],
    color: "#D946EF",
  },
  {
    name: "Explanatory Thinking",
    description:
      "Making complexity understandable. Something here finds the story inside a problem.",
    requiredSkills: ["Storytelling", "Problem Solving"],
    color: "#004D40",
  },
  {
    name: "Narrative Leadership",
    description:
      "Something here uses language not just to describe where things are going — but to help others see it too.",
    requiredSkills: ["Storytelling", "Leadership"],
    color: "#880E4F",
  },

  // ── Critical Analysis pairs ─────────────────────────────────────────────────
  {
    name: "Constructive Thinking",
    description:
      "Thinking that gets better when it's shared — and makes the group's thinking better in return.",
    requiredSkills: ["Critical Analysis", "Collaboration"],
    color: "#66BB6A",
  },
  {
    name: "Compassionate Reasoning",
    description:
      "You think clearly about what matters. You balance logic with genuine care for people.",
    requiredSkills: ["Critical Analysis", "Empathy"],
    color: "#4ECDC4",
  },
  {
    name: "Tenacious Inquiry",
    description:
      "The questions don't stop when things get difficult. Something here holds the thread even when it would be easier to let go.",
    requiredSkills: ["Critical Analysis", "Resilience"],
    color: "#C62828",
  },
  {
    name: "Inventive Analysis",
    description:
      "Analysis that opens doors rather than just closing them. Something here finds what's possible inside a problem.",
    requiredSkills: ["Critical Analysis", "Innovation"],
    color: "#7E57C2",
  },
  {
    name: "Intellectual Independence",
    description:
      "Figures things out on its own terms. Something here runs on internal fuel.",
    requiredSkills: ["Critical Analysis", "Self-Direction"],
    color: "#00897B",
  },
  {
    name: "Reasoned Voice",
    description:
      "Views that arrive with the thinking behind them. Something here doesn't just say what — it shows why.",
    requiredSkills: ["Critical Analysis", "Advocacy"],
    color: "#7C83E5",
  },
  {
    name: "Diagnostic Thinking",
    description:
      "Problems get taken apart before they get solved. Something here looks closely before it acts.",
    requiredSkills: ["Critical Analysis", "Problem Solving"],
    color: "#1565C0",
  },
  {
    name: "Considered Direction",
    description:
      "Something here thinks before it moves — and the thinking tends to make the action better.",
    requiredSkills: ["Critical Analysis", "Leadership"],
    color: "#4CAF50",
  },

  // ── Collaboration pairs ─────────────────────────────────────────────────────
  {
    name: "Inclusive Practice",
    description:
      "Working together isn't just about getting things done. Something here makes sure people actually feel part of it.",
    requiredSkills: ["Collaboration", "Empathy"],
    color: "#FFA726",
  },
  {
    name: "Steadfast Partnership",
    description:
      "Groups don't always run smoothly. Something here keeps showing up and holding things together.",
    requiredSkills: ["Collaboration", "Resilience"],
    color: "#795548",
  },
  {
    name: "Collective Imagination",
    description:
      "Ideas tend to grow when they're shared. Something here brings people together around what might be possible.",
    requiredSkills: ["Collaboration", "Innovation"],
    color: "#42A5F5",
  },
  {
    name: "Disciplined Collaboration",
    description:
      "Knows how to work alongside others and how to work alone. Something here seems to know when each is needed.",
    requiredSkills: ["Collaboration", "Self-Direction"],
    color: "#29B6F6",
  },
  {
    name: "Collective Voice",
    description:
      "Something here brings people together around ideas that matter. The group becomes part of the argument.",
    requiredSkills: ["Collaboration", "Advocacy"],
    color: "#F06595",
  },
  {
    name: "Shared Solutions",
    description:
      "Problems look different when more minds are on them. Something here understands that — and acts on it.",
    requiredSkills: ["Collaboration", "Problem Solving"],
    color: "#8BC34A",
  },
  {
    name: "Facilitative Leadership",
    description:
      "Leadership that looks like making the group better. Something here helps things move without taking over.",
    requiredSkills: ["Collaboration", "Leadership"],
    color: "#26A69A",
  },

  // ── Empathy pairs ───────────────────────────────────────────────────────────
  {
    name: "Compassionate Persistence",
    description:
      "Caring for others isn't always easy. Something here keeps doing it anyway.",
    requiredSkills: ["Empathy", "Resilience"],
    color: "#AD1457",
  },
  {
    name: "Human-Centred Thinking",
    description:
      "New ideas that begin with understanding people. Something here asks whether a solution actually fits the humans it's meant for.",
    requiredSkills: ["Empathy", "Innovation"],
    color: "#8E24AA",
  },
  {
    name: "Reflective Awareness",
    description:
      "An attention to both self and others that's still developing. Something here notices the space between people and itself.",
    requiredSkills: ["Empathy", "Self-Direction"],
    color: "#1976D2",
  },
  {
    name: "Voice for Others",
    description:
      "Something here speaks up — not just for itself, but for what others might need. The advocacy comes from understanding, not just opinion.",
    requiredSkills: ["Empathy", "Advocacy"],
    color: "#2BC0B4",
  },
  {
    name: "People-First Solutions",
    description:
      "Solutions that take people into account. Something here asks how this affects others before calling it solved.",
    requiredSkills: ["Empathy", "Problem Solving"],
    color: "#F57F17",
  },
  {
    name: "Relational Leadership",
    description:
      "Something here leads by understanding what people need. The direction comes from the relationship, not just the task.",
    requiredSkills: ["Empathy", "Leadership"],
    color: "#2E7D32",
  },

  // ── Resilience pairs ────────────────────────────────────────────────────────
  {
    name: "Persistent Creativity",
    description:
      "Things don't always work the first time. Something here keeps going and keeps looking for new approaches.",
    requiredSkills: ["Resilience", "Innovation"],
    color: "#BF360C",
  },
  {
    name: "Inner Momentum",
    description:
      "Something here manages itself through difficulty. Keeps going without needing external pressure.",
    requiredSkills: ["Resilience", "Self-Direction"],
    color: "#4A148C",
  },
  {
    name: "Purposeful Action",
    description:
      "Something here runs deeper than just getting things done. A sense of what matters is starting to show up in how you act.",
    requiredSkills: ["Resilience", "Advocacy"],
    color: "#A29BFE",
  },
  {
    name: "Tenacious Solutions",
    description:
      "Some problems take longer than expected. Something here stays with them.",
    requiredSkills: ["Resilience", "Problem Solving"],
    color: "#E65100",
  },
  {
    name: "Steadfast Leadership",
    description:
      "Leadership tends to show most when things aren't going smoothly. Something here steps up in those moments.",
    requiredSkills: ["Resilience", "Leadership"],
    color: "#01579B",
  },

  // ── Innovation pairs ────────────────────────────────────────────────────────
  {
    name: "Self-Driven Creativity",
    description:
      "Something here generates its own momentum. Ideas emerge and get followed without waiting for permission.",
    requiredSkills: ["Innovation", "Self-Direction"],
    color: "#006064",
  },
  {
    name: "Disruptive Voice",
    description:
      "Something here doesn't just have new ideas — it makes the case for them.",
    requiredSkills: ["Innovation", "Advocacy"],
    color: "#F97316",
  },
  {
    name: "Inventive Problem Solving",
    description:
      "Problems become invitations. Something here looks for the angle that hasn't been tried yet.",
    requiredSkills: ["Innovation", "Problem Solving"],
    color: "#6A1B9A",
  },
  {
    name: "Creative Leadership",
    description:
      "You bring imagination into how things get done. When you're involved, people tend to see more of what's possible.",
    requiredSkills: ["Innovation", "Leadership"],
    color: "#FF6B6B",
  },

  // ── Self-Direction pairs ────────────────────────────────────────────────────
  {
    name: "Values-Led Learning",
    description:
      "Something here knows what it cares about — and seems to organise itself around that.",
    requiredSkills: ["Self-Direction", "Advocacy"],
    color: "#06B6D4",
  },
  {
    name: "Autonomous Inquiry",
    description:
      "Questions get pursued. Something here follows a thread independently and finds things out.",
    requiredSkills: ["Self-Direction", "Problem Solving"],
    color: "#0D47A1",
  },
  {
    name: "Leading by Example",
    description:
      "Something here leads quietly — through how it works, not how it talks about working.",
    requiredSkills: ["Self-Direction", "Leadership"],
    color: "#33691E",
  },

  // ── Advocacy pairs ──────────────────────────────────────────────────────────
  {
    name: "Strategic Voice",
    description:
      "Arguments that come with answers attached. Something here doesn't just name the problem — it thinks about what to do.",
    requiredSkills: ["Advocacy", "Problem Solving"],
    color: "#EF5350",
  },
  {
    name: "Civic Leadership",
    description:
      "Something here leads by making a case — bringing people along through reasoning and conviction, not just authority.",
    requiredSkills: ["Advocacy", "Leadership"],
    color: "#9575CD",
  },

  // ── Problem Solving + Leadership ────────────────────────────────────────────
  {
    name: "Decisive Action",
    description:
      "Leadership that shows up in the moment. Something here figures out what needs to happen and helps others act on it.",
    requiredSkills: ["Problem Solving", "Leadership"],
    color: "#B71C1C",
  },
];

export function findSurpriseCapability(
  skillNames: string[]
): SurpriseCapability | null {
  const nameSet = new Set(skillNames);
  for (const surprise of SURPRISE_CAPABILITIES) {
    if (surprise.requiredSkills.every((s) => nameSet.has(s))) {
      return surprise;
    }
  }
  return null;
}

// ─── Capability Recipes ─────────────────────────────────────────────────────────
// Skills that combine to unlock SACE capabilities.
// Derived from element overlap: each skill's elements were mapped to their parent
// capabilities via ELEMENT_CAPABILITY_MAP — skills with the strongest overlap
// with a capability are assigned to it.
//
// Skill → Capability assignments (each skill appears in at most 2 capabilities):
//   Storytelling       → Communication
//   Collaboration      → Communication, Collective Engagement
//   Advocacy           → Communication, Principled Action
//   Critical Analysis  → Quality Thinking
//   Problem Solving    → Quality Thinking, Self-motivated Learning
//   Innovation         → Quality Thinking, Personal Enterprise
//   Empathy            → Collective Engagement, Principled Action
//   Leadership         → Collective Engagement, Personal Enterprise
//   Resilience         → Principled Action, Self-motivated Learning
//   Self-Direction     → Personal Enterprise, Self-motivated Learning
//
// 3 skills per capability, minMatch=2 → C(3,2)+C(3,3) = 4 combos × 6 caps = 24 total.

export interface CapabilityRecipe {
  name: string;
  // Student-facing "I can..." statement from the SACE framework
  description: string;
  // The skills that combine to reveal this capability
  skills: string[];
  // Minimum skills needed to unlock (allows partial discovery)
  minMatch: number;
  color: string;
  colorLight: string;
}

export const CAPABILITY_RECIPES: CapabilityRecipe[] = [
  {
    name: "Communication",
    description:
      "I can communicate to enhance relationships, shape understanding and build connections.",
    skills: ["Storytelling", "Collaboration", "Advocacy"],
    minMatch: 2,
    color: "#C17F24",
    colorLight: "#F5DEB3",
  },
  {
    name: "Quality Thinking",
    description:
      "I am curious about the world around me and use a range of thinking strategies to shape my understanding.",
    skills: ["Critical Analysis", "Problem Solving", "Innovation"],
    minMatch: 2,
    color: "#1A7A6D",
    colorLight: "#B2DFDB",
  },
  {
    name: "Collective Engagement",
    description:
      "I can be inclusive of ideas, people, and perspectives to generate purposeful outcomes.",
    skills: ["Collaboration", "Empathy", "Leadership"],
    minMatch: 2,
    color: "#B85C38",
    colorLight: "#FFCCBC",
  },
  {
    name: "Personal Enterprise",
    description:
      "I can demonstrate initiative, pursue opportunities, produce outcomes of value, and get things done.",
    skills: ["Innovation", "Leadership", "Self-Direction"],
    minMatch: 2,
    color: "#C47030",
    colorLight: "#FFE0B2",
  },
  {
    name: "Principled Action",
    description:
      "I can be responsible for my actions and consider the impact I have on others and the world around me.",
    skills: ["Empathy", "Advocacy", "Resilience"],
    minMatch: 2,
    color: "#5E8B60",
    colorLight: "#C8E6C9",
  },
  {
    name: "Self-motivated Learning",
    description:
      "I can embrace challenges as opportunities and persevere and be active in my own learning.",
    skills: ["Resilience", "Self-Direction", "Problem Solving"],
    minMatch: 2,
    color: "#7E6B8F",
    colorLight: "#E1BEE7",
  },
];

// ─── Capability Matrix ──────────────────────────────────────────────────────────
// All valid skill combinations that unlock each SACE capability.
//
// Communication        — Storytelling · Collaboration · Advocacy
//   Storytelling + Collaboration
//   Storytelling + Advocacy
//   Collaboration + Advocacy
//   Storytelling + Collaboration + Advocacy
//
// Quality Thinking     — Critical Analysis · Problem Solving · Innovation
//   Critical Analysis + Problem Solving
//   Critical Analysis + Innovation
//   Problem Solving + Innovation
//   Critical Analysis + Problem Solving + Innovation
//
// Collective Engagement — Collaboration · Empathy · Leadership
//   Collaboration + Empathy
//   Collaboration + Leadership
//   Empathy + Leadership
//   Collaboration + Empathy + Leadership
//
// Personal Enterprise  — Innovation · Leadership · Self-Direction
//   Innovation + Leadership
//   Innovation + Self-Direction
//   Leadership + Self-Direction
//   Innovation + Leadership + Self-Direction
//
// Principled Action    — Empathy · Advocacy · Resilience
//   Empathy + Advocacy
//   Empathy + Resilience
//   Advocacy + Resilience
//   Empathy + Advocacy + Resilience
//
// Self-motivated Learning — Resilience · Self-Direction · Problem Solving
//   Resilience + Self-Direction
//   Resilience + Problem Solving
//   Self-Direction + Problem Solving
//   Resilience + Self-Direction + Problem Solving

export interface CapabilityCombination {
  skills: string[];
  capability: CapabilityRecipe;
}

function capabilityCombos(recipe: CapabilityRecipe): CapabilityCombination[] {
  const [a, b, c] = recipe.skills;
  return [
    { skills: [a, b], capability: recipe },
    { skills: [a, c], capability: recipe },
    { skills: [b, c], capability: recipe },
    { skills: [a, b, c], capability: recipe },
  ];
}

export const CAPABILITY_COMBINATIONS: CapabilityCombination[] =
  CAPABILITY_RECIPES.flatMap(capabilityCombos);

// Returns the best-matching capability for a given set of discovered skill names.
// Most overlap ≥ minMatch wins; ties broken by recipe order.
export function findCapabilityForSkills(
  skillNames: string[]
): CapabilityRecipe | null {
  const nameSet = new Set(skillNames);
  let best: { recipe: CapabilityRecipe; overlap: number } | null = null;
  for (const recipe of CAPABILITY_RECIPES) {
    const overlap = recipe.skills.filter((s) => nameSet.has(s)).length;
    if (overlap >= recipe.minMatch) {
      if (!best || overlap > best.overlap) best = { recipe, overlap };
    }
  }
  return best ? best.recipe : null;
}

// ─── Capability matching ────────────────────────────────────────────────────────
// When elements from the same capability are stacked, that capability forms.

import { ELEMENT_CAPABILITY_MAP } from "./profile";

export function findMatchingCapabilities(
  elementNames: string[],
  minMatch: number = 3
): { capability: string; matchedElements: string[]; total: number }[] {
  // Count how many stacked elements belong to each capability
  const capCounts: Record<string, string[]> = {};

  for (const el of elementNames) {
    const caps = ELEMENT_CAPABILITY_MAP[el] || [];
    for (const cap of caps) {
      if (!capCounts[cap]) capCounts[cap] = [];
      capCounts[cap].push(el);
    }
  }

  return Object.entries(capCounts)
    .filter(([, els]) => els.length >= minMatch)
    .map(([cap, els]) => ({
      capability: cap,
      matchedElements: els,
      total: els.length,
    }))
    .sort((a, b) => b.total - a.total);
}

// Given a set of element names, find which skill recipes match
export function findMatchingSkills(elementNames: string[]): SkillRecipe[] {
  const nameSet = new Set(elementNames);
  return SKILL_RECIPES.filter((recipe) => {
    const matches = recipe.elements.filter((el) => nameSet.has(el));
    return matches.length >= recipe.minMatch;
  });
}

// ─── Skills Matrix ──────────────────────────────────────────────────────────────
// All valid element combinations that unlock each skill.
// Each recipe has 4 elements with minMatch=3, giving C(4,3)+C(4,4) = 5 combos per skill.
// 10 skills × 5 combos = 50 total combinations.
//
// Storytelling   — Being creative · Comprehending · Adapting · Using tools
// Critical Analysis — Inquiring · Reasoning · Developing informed opinions · Being curious
// Collaboration  — Engaging in dialogue · Making contributions · Demonstrating respect · Adapting
// Empathy        — Being considerate and caring · Embracing diversity · Demonstrating respect · Forming relationships
// Resilience     — Demonstrating perseverance · Being reflective · Adapting · Being responsible
// Innovation     — Being creative · Being curious · Taking opportunities · Demonstrating initiative
// Self-Direction — Being organised · Being reflective · Engaging with feedback · Being responsible
// Advocacy       — Developing informed opinions · Engaging in dialogue · Reasoning · Embracing diversity
// Problem Solving — Reasoning · Adapting · Inquiring · Using tools
// Leadership     — Demonstrating initiative · Engaging in dialogue · Forming relationships · Making contributions

export interface SkillCombination {
  elements: string[];
  skill: SkillRecipe;
}

function combos3(recipe: SkillRecipe): SkillCombination[] {
  const [a, b, c, d] = recipe.elements;
  return [
    { elements: [a, b, c], skill: recipe },
    { elements: [a, b, d], skill: recipe },
    { elements: [a, c, d], skill: recipe },
    { elements: [b, c, d], skill: recipe },
    { elements: [a, b, c, d], skill: recipe },
  ];
}

export const SKILL_COMBINATIONS: SkillCombination[] = SKILL_RECIPES.flatMap(combos3);

// Returns the best-matching skill for a given set of element names.
// Exact 4-element match beats any 3-element match; ties broken by recipe order.
export function findSkillForElements(elementNames: string[]): SkillRecipe | null {
  const nameSet = new Set(elementNames);
  let best: { recipe: SkillRecipe; overlap: number } | null = null;
  for (const recipe of SKILL_RECIPES) {
    const overlap = recipe.elements.filter((el) => nameSet.has(el)).length;
    if (overlap >= recipe.minMatch) {
      if (!best || overlap > best.overlap) best = { recipe, overlap };
    }
  }
  return best ? best.recipe : null;
}

// Find partial matches — recipes that are close (for hints)
export function findPartialMatches(
  elementNames: string[]
): { recipe: SkillRecipe; matched: string[]; missing: string[] }[] {
  const nameSet = new Set(elementNames);
  return SKILL_RECIPES
    .map((recipe) => {
      const matched = recipe.elements.filter((el) => nameSet.has(el));
      const missing = recipe.elements.filter((el) => !nameSet.has(el));
      return { recipe, matched, missing };
    })
    .filter((r) => r.matched.length >= 2 && r.matched.length < r.recipe.minMatch)
    .sort((a, b) => b.matched.length - a.matched.length);
}
