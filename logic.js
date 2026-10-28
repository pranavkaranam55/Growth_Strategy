/*
 * Campus Growth Engine: core rules.
 * Pure functions with no browser code, so the same file runs in the web app
 * and in the automated tests (node --test) that GitHub Actions runs on every push.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.GE = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const CONFIG = {
    goal: 500,
    budget: 2000,
    reserve: 400, // campaign costs and contingency, kept outside ambassador rewards
    ambassadors: [
      { slot: "A1", target: 250, reward: 800 },
      { slot: "A2", target: 150, reward: 500 },
      { slot: "A3", target: 100, reward: 300 },
    ],
    milestonePercents: [25, 50, 75, 100],
    // Planned cumulative registrations at the end of each day (Day 1 is setup).
    dayPlan: [0, 100, 180, 260, 340, 420, 500],
  };

  /** Keep only the digits of a phone number; use the last 10 (drops +91 or a leading 0). */
  function normalizePhone(raw) {
    const digits = String(raw || "").replace(/\D/g, "");
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }

  /** A valid Indian mobile number: 10 digits starting with 6, 7, 8 or 9. */
  function isValidPhone(raw) {
    return /^[6-9]\d{9}$/.test(normalizePhone(raw));
  }

  /** Referral code like "GE-ARJ7Q": prefix + first letters of the name + random characters. */
  function makeReferralCode(name, rand) {
    const letters = String(name || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3).padEnd(3, "X");
    const r = rand || Math.random;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let tail = "";
    for (let i = 0; i < 2; i++) tail += chars[Math.floor(r() * chars.length)];
    return "GE-" + letters + tail;
  }

  /**
   * Decide which ambassador gets credit for a sign-up.
   * Only a code that belongs to a known ambassador counts; anything else is "direct".
   * Codes are matched without caring about upper/lower case.
   */
  function attribute(code, ambassadors) {
    const c = String(code || "").trim().toUpperCase();
    if (!c) return null;
    const hit = (ambassadors || []).find((a) => a.code.toUpperCase() === c);
    return hit ? hit.id : null;
  }

  /**
   * Verified registrations: complete records with a valid phone, counted once per phone.
   * If the same phone appears twice, the earliest one wins (one primary source).
   */
  function verifiedRegistrations(regs) {
    const seen = new Set();
    return [...(regs || [])]
      .filter((r) => r && r.name && r.name.trim().length >= 2 && isValidPhone(r.phone) && r.finalYear === true)
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
      .filter((r) => {
        const p = normalizePhone(r.phone);
        if (seen.has(p)) return false;
        seen.add(p);
        return true;
      });
  }

  /** Is this phone already registered? */
  function isDuplicate(phone, regs) {
    const p = normalizePhone(phone);
    return (regs || []).some((r) => normalizePhone(r.phone) === p);
  }

  /** Verified sign-ups credited to each ambassador id. */
  function countsByAmbassador(regs) {
    const out = {};
    verifiedRegistrations(regs).forEach((r) => {
      if (r.ambassadorId) out[r.ambassadorId] = (out[r.ambassadorId] || 0) + 1;
    });
    return out;
  }

  /** The registration counts at which an ambassador should be messaged. */
  function milestonesFor(target) {
    return CONFIG.milestonePercents.map((p) => Math.ceil((target * p) / 100));
  }

  /**
   * Milestones that are due now: reached, and not messaged before.
   * This is what guarantees "notifications only at milestones", and never twice.
   */
  function dueMilestones(count, target, alreadySent) {
    const sent = new Set(alreadySent || []);
    return milestonesFor(target).filter((m) => count >= m && !sent.has(m));
  }

  /** Reward for an ambassador: the full amount only once the full target is reached. */
  function rewardFor(count, target, reward) {
    return count >= target ? reward : 0;
  }

  /** Total planned spend: every ambassador reward plus the reserve. Must fit the budget. */
  function plannedSpend(config) {
    const c = config || CONFIG;
    return c.ambassadors.reduce((sum, a) => sum + a.reward, 0) + c.reserve;
  }

  /** Can a payout of this amount be approved without going over budget? */
  function canApprove(amount, alreadyCommitted, config) {
    const c = config || CONFIG;
    return amount > 0 && alreadyCommitted + amount <= c.budget - c.reserve;
  }

  /** Conversion rate (%) from link opens to verified registrations. */
  function conversionRate(verified, clicks) {
    if (!clicks) return 0;
    return Math.round((verified / clicks) * 1000) / 10;
  }

  /** Campaign day (1-7) for a date, given the start date of Day 1. */
  function campaignDay(dateIso, startIso) {
    const start = new Date(startIso); start.setHours(0, 0, 0, 0);
    const d = new Date(dateIso); d.setHours(0, 0, 0, 0);
    return Math.floor((d - start) / 86400000) + 1;
  }

  /** WhatsApp message text for a milestone (simulated sending). */
  function milestoneMessage(name, milestone, target, reward) {
    if (milestone >= target) {
      return `Congratulations ${name}! You have reached ${milestone} verified registrations. Reward of ₹${reward} status: Pending approval.`;
    }
    const pct = Math.round((milestone / target) * 100);
    return `Great work ${name}! ${milestone} verified registrations (${pct}% of your ${target} target). Keep sharing your link.`;
  }

  return {
    CONFIG, normalizePhone, isValidPhone, makeReferralCode, attribute, verifiedRegistrations,
    isDuplicate, countsByAmbassador, milestonesFor, dueMilestones, rewardFor, plannedSpend,
    canApprove, conversionRate, campaignDay, milestoneMessage,
  };
});
