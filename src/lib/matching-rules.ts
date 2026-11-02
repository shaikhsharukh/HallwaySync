import { Attendee, MatchRecommendation } from '../types/models';
import { EventCategory, ProfessionalRole } from '../types/database';

const COMPLEMENTARY_PAIRS: Record<ProfessionalRole, ProfessionalRole[]> = {
  Frontend: ['Backend', 'AI/ML', 'UI/UX', 'Product'],
  Backend: ['Frontend', 'AI/ML', 'Mobile', 'UI/UX'],
  Fullstack: ['AI/ML', 'UI/UX', 'Product', 'Founder'],
  'AI/ML': ['Frontend', 'Backend', 'Fullstack', 'Product'],
  Mobile: ['Backend', 'UI/UX', 'Product'],
  'UI/UX': ['Frontend', 'Fullstack', 'Mobile', 'Product'],
  Product: ['Frontend', 'Backend', 'Fullstack', 'Founder'],
  Founder: ['Fullstack', 'Backend', 'AI/ML', 'Product'],
  Other: ['Fullstack', 'Frontend', 'Backend'],
};

export function calculateRoomMatches(
  currentUser: Attendee,
  pool: Attendee[],
  category: EventCategory,
  limit: number = 20
): MatchRecommendation[] {
  const recommendations: MatchRecommendation[] = [];

  for (const candidate of pool) {
    if (candidate.id === currentUser.id || candidate.is_banned) {
      continue;
    }

    let score = 0;
    let reason = '';
    let matchCategory: MatchRecommendation['matchCategory'] = 'domain_affinity';

    const isComplementaryRole =
      COMPLEMENTARY_PAIRS[currentUser.role]?.includes(candidate.role) ?? false;

    // 1. Shared Skills (Jaccard Intersection)
    const currentSkills = new Set(currentUser.skills.map((s) => s.toLowerCase()));
    const candidateSkills = new Set(candidate.skills.map((s) => s.toLowerCase()));
    const sharedSkills = [...currentSkills].filter((s) => candidateSkills.has(s));

    // 2. Intent Alignment
    const bothWantTeam =
      currentUser.intent.some((i) => i.includes('Team') || i.includes('Devs')) &&
      candidate.intent.some((i) => i.includes('Team') || i.includes('Devs'));

    const bothWantChat =
      currentUser.intent.some((i) => i.includes('Chat') || i.includes('Network')) &&
      candidate.intent.some((i) => i.includes('Chat') || i.includes('Network'));

    // Scoring heuristic by Event Type
    if (category === 'hackathon') {
      if (bothWantTeam) score += 35;
      if (isComplementaryRole) {
        score += 40;
        matchCategory = 'team_complement';
        reason = `Complementary Roles: You have ${currentUser.role}; they specialize in ${candidate.role} for team building.`;
      } else if (sharedSkills.length > 0) {
        score += Math.min(sharedSkills.length * 15, 30);
        matchCategory = 'domain_affinity';
        reason = `Shared Stack: Both of you build with ${sharedSkills.slice(0, 2).join(' & ')}.`;
      } else {
        score += 15;
        reason = `Both looking to join or form a hackathon team.`;
      }
    } else if (category === 'summit') {
      if (isComplementaryRole) {
        score += 40;
        matchCategory = 'cross_discipline';
        reason = `Cross-Discipline Alignment: ${currentUser.role} connecting with ${candidate.role}.`;
      }
      if (sharedSkills.length > 0) {
        score += Math.min(sharedSkills.length * 12, 30);
      }
      if (bothWantChat) score += 20;
      if (!reason) {
        reason = `Mutual networking goals at this summit.`;
      }
    } else {
      // Meetup / General
      if (sharedSkills.length > 0) {
        score += 45 + Math.min(sharedSkills.length * 10, 30);
        matchCategory = 'domain_affinity';
        reason = `Technical Alignment: Both interested in ${sharedSkills.slice(0, 2).join(' & ')}.`;
      } else if (isComplementaryRole) {
        score += 35;
        matchCategory = 'cross_discipline';
        reason = `Complementary background: ${currentUser.role} and ${candidate.role}.`;
      } else {
        score += 20;
        reason = `Fellow community members in the room.`;
      }
    }

    // Availability bonus
    if (candidate.is_available_to_chat) {
      score += 10;
    }

    score = Math.min(score, 100);

    recommendations.push({
      attendee: candidate,
      matchScore: score,
      matchReason: reason,
      matchCategory,
    });
  }

  // Sort descending by score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}
