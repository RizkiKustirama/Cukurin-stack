import { describe, it, expect } from "bun:test";
import { SubscriptionStatus } from "@prisma/client";
import {
  getTrialDaysRemaining,
  checkSubscriptionAccess,
  subscriptionService,
} from "./subscriptionService";

describe("subscriptionService - getTrialDaysRemaining", () => {
  it("should calculate remaining days correctly for 7 days ahead", () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const days = getTrialDaysRemaining(future);
    expect(days).toBe(7);
  });

  it("should clamp to maximum 14 days if date is further ahead", () => {
    const future = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000);
    const days = getTrialDaysRemaining(future);
    expect(days).toBe(14);
  });

  it("should return 0 if trial date is in the past", () => {
    const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const days = getTrialDaysRemaining(past);
    expect(days).toBe(0);
  });

  it("should handle ISO string format", () => {
    const futureIso = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const days = getTrialDaysRemaining(futureIso);
    expect(days).toBe(3);
  });

  it("should return 0 for invalid date strings", () => {
    expect(getTrialDaysRemaining("invalid-date-string")).toBe(0);
  });
});

describe("subscriptionService - checkSubscriptionAccess", () => {
  it("allows access for ACTIVE subscription even if trial expired", () => {
    const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const result = checkSubscriptionAccess(SubscriptionStatus.ACTIVE, past);
    expect(result.isAllowed).toBe(true);
    expect(result.isTrial).toBe(false);
    expect(result.isExpired).toBe(false);
    expect(result.daysRemaining).toBe(0);
  });

  it("allows access for active TRIAL with future trialEndsAt", () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const result = checkSubscriptionAccess(SubscriptionStatus.TRIAL, future);
    expect(result.isAllowed).toBe(true);
    expect(result.isTrial).toBe(true);
    expect(result.isExpired).toBe(false);
    expect(result.daysRemaining).toBe(5);
  });

  it("denies access for TRIAL when trialEndsAt is in the past", () => {
    const past = new Date(Date.now() - 1000);
    const result = checkSubscriptionAccess(SubscriptionStatus.TRIAL, past);
    expect(result.isAllowed).toBe(false);
    expect(result.isTrial).toBe(true);
    expect(result.isExpired).toBe(true);
    expect(result.daysRemaining).toBe(0);
    expect(result.reason).toContain("berakhir");
  });

  it("denies access for EXPIRED status", () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const result = checkSubscriptionAccess(SubscriptionStatus.EXPIRED, future);
    expect(result.isAllowed).toBe(false);
    expect(result.isTrial).toBe(false);
    expect(result.isExpired).toBe(true);
    expect(result.reason).toContain("kedaluwarsa");
  });

  it("denies access for SUSPENDED status", () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const result = checkSubscriptionAccess(SubscriptionStatus.SUSPENDED, future);
    expect(result.isAllowed).toBe(false);
    expect(result.isTrial).toBe(false);
    expect(result.isExpired).toBe(false);
    expect(result.reason).toContain("ditangguhkan");
  });

  it("subscriptionService object exports both methods", () => {
    expect(typeof subscriptionService.getTrialDaysRemaining).toBe("function");
    expect(typeof subscriptionService.checkSubscriptionAccess).toBe("function");
  });
});
