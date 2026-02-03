# SOP: Bug Fix

**Standard Operating Procedure for fixing bugs**

---

## Overview

This SOP defines the structured workflow for fixing bugs in a project. It emphasizes root cause analysis, minimal changes, and comprehensive regression testing to prevent introducing new issues.

## Objectives

- Identify and fix root cause, not just symptoms
- Minimize code changes to reduce risk
- Prevent regression with thorough testing
- Document the fix for future reference
- Learn from the bug to prevent similar issues

## Required Agents

- **PM** (Project Manager) - Prioritization and coordination
- **TA** (Technical Analyst) - Root cause investigation
- **FE** (UI/UX Engineer) - Implementation
- **QA** (Quality Assurance) - Regression testing

**Note**: Design agent is not required for bug fixes unless UX changes are needed.

## Workflow Steps

### Step 1: Bug Analysis & Prioritization
**Agent**: PM (Project Manager)
**Priority**: Critical
**Estimated Time**: 5-10 minutes

**Inputs**:
- `bug_report` - Bug description and reproduction steps
- `project_context` - Current project state

**Actions**:
1. Review bug report thoroughly
2. Reproduce the bug if possible
3. Assess severity and impact
4. Determine priority (critical, high, medium, low)
5. Identify affected users/features
6. Create fix plan with scope
7. Set success criteria

**Outputs**:
- `bug_analysis` - Detailed analysis of the bug
- `fix_plan` - Plan for fixing the bug

**Validation**:
- Bug is reproducible and well-understood
- Severity is correctly assessed
- Fix scope is clearly defined
- Priority is appropriate

**Priority Levels**:
- **Critical**: System down, data loss, security breach → Fix immediately
- **High**: Major feature broken, many users affected → Fix within 24h
- **Medium**: Minor feature broken, workaround exists → Fix within 1 week
- **Low**: Cosmetic issue, minimal impact → Fix in next sprint

---

### Step 2: Root Cause Investigation
**Agent**: TA (Technical Analyst)
**Priority**: Critical
**Estimated Time**: 10-20 minutes

**Inputs**:
- `bug_analysis` - Analysis from PM
- `codebase` - Existing codebase

**Actions**:
1. Reproduce the bug locally
2. Trace execution flow to find root cause
3. Identify the exact source of the problem
4. Determine all affected areas
5. Check for similar issues elsewhere
6. Analyze why the bug was introduced
7. Propose minimal fix approach

**Outputs**:
- `root_cause_analysis` - Detailed root cause analysis
- `affected_files` - List of files that need changes

**Validation**:
- Root cause is clearly identified (not just symptoms)
- All affected areas are documented
- Fix approach is minimal and safe
- Similar issues are identified

**Investigation Techniques**:
- **Stack Trace Analysis**: Follow error stack traces
- **Debugging**: Use debugger to step through code
- **Log Analysis**: Review application logs
- **Bisection**: Use git bisect to find when bug was introduced
- **Unit Testing**: Write failing test that reproduces bug

---

### Step 3: Bug Fix Implementation
**Agent**: FE (UI/UX Engineer)
**Priority**: Critical
**Estimated Time**: 10-20 minutes

**Inputs**:
- `root_cause_analysis` - Analysis from TA
- `affected_files` - Files to modify

**Actions**:
1. Review root cause analysis
2. Implement minimal fix
3. Avoid refactoring or improvements (unless directly related)
4. Ensure fix addresses root cause, not symptoms
5. Test fix locally
6. Verify no new issues introduced
7. Update error messages if needed

**Outputs**:
- `fix_code` - Code changes that fix the bug
- `changed_files` - List of modified files

**Validation**:
- Changes are minimal and focused
- Fix addresses root cause
- No refactoring or scope creep
- Code follows project conventions
- TypeScript compiles without errors

**Fix Principles**:
- **Minimal Changes**: Change only what's necessary
- **Root Cause**: Fix the cause, not the symptom
- **No Refactoring**: Save improvements for separate PR
- **Backward Compatible**: Don't break existing functionality
- **Clear Intent**: Code changes are obvious and well-commented

---

### Step 4: Regression Testing & Verification
**Agent**: QA (Quality Assurance)
**Priority**: Critical
**Estimated Time**: 10-15 minutes

**Inputs**:
- `fix_code` - Code changes from FE
- `bug_report` - Original bug report

**Actions**:
1. Verify the bug is fixed
2. Test all affected areas
3. Run full regression test suite
4. Add regression test to prevent recurrence
5. Test edge cases related to the bug
6. Verify no new bugs introduced
7. Measure test coverage

**Outputs**:
- `test_results` - Test results and verification
- `regression_report` - Regression testing summary

**Validation**:
- Original bug is fixed
- Regression test added
- All existing tests still pass
- No new bugs introduced
- Coverage maintained or improved

**Testing Checklist**:
- [ ] Bug is no longer reproducible
- [ ] New regression test added
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Edge cases tested
- [ ] Performance not degraded
- [ ] No new warnings or errors

---

### Step 5: Review & Documentation
**Agent**: PM (Project Manager)
**Priority**: High
**Estimated Time**: 5 minutes

**Inputs**:
- `fix_code` - Implemented fix
- `test_results` - Test results from QA

**Actions**:
1. Review fix and test results
2. Verify minimal changes principle
3. Ensure regression test is added
4. Document the fix
5. Update issue tracker
6. Communicate fix to stakeholders
7. Sign off on closure

**Outputs**:
- `closure_summary` - Summary of bug fix

**Validation**:
- Bug is truly fixed (not just masked)
- Regression test prevents recurrence
- Documentation is complete
- Stakeholders are informed

---

## Success Criteria

The bug fix is successful when:

- ✅ Root cause is identified and fixed
- ✅ Bug is no longer reproducible
- ✅ Regression test added
- ✅ All existing tests still pass
- ✅ No new bugs introduced
- ✅ Changes are minimal and focused
- ✅ Documentation updated
- ✅ PM has approved closure

## Failure Handling

If fix fails or introduces new issues:

1. **Rollback**: Revert the changes
2. **Re-analyze**: TA investigates further
3. **Alternative Approach**: Try different fix
4. **Escalate**: If multiple attempts fail, escalate to PM
5. **Document**: Update incident report with findings

## Time Estimates

| Step | Agent | Estimated Time |
|------|-------|----------------|
| 1. Bug Analysis | PM | 5-10 min |
| 2. Root Cause Investigation | TA | 10-20 min |
| 3. Fix Implementation | FE | 10-20 min |
| 4. Regression Testing | QA | 10-15 min |
| 5. Review & Documentation | PM | 5 min |

**Total Estimated Time**: 40-70 minutes

**Critical Path**: Steps 1 → 2 → 3 → 4 → 5 (all sequential)

## Best Practices

### DO:
- ✅ Reproduce the bug before fixing
- ✅ Find root cause, not just symptoms
- ✅ Make minimal, targeted changes
- ✅ Add regression test
- ✅ Test thoroughly before closing
- ✅ Document the fix
- ✅ Learn from the bug

### DON'T:
- ❌ Fix symptoms without finding root cause
- ❌ Make unnecessary refactoring changes
- ❌ Skip regression testing
- ❌ Close bug without verification
- ❌ Ignore similar issues elsewhere
- ❌ Rush the investigation
- ❌ Introduce new features while fixing bugs

## Bug Severity Guidelines

### Critical (P0)
- **Examples**: System crash, data loss, security breach, payment failure
- **Response Time**: Immediate (within 1 hour)
- **Fix Timeline**: ASAP (within 4-8 hours)
- **Testing**: Thorough but fast
- **Deployment**: Hotfix immediately

### High (P1)
- **Examples**: Major feature broken, many users affected, workaround complex
- **Response Time**: Within 4 hours
- **Fix Timeline**: Within 24 hours
- **Testing**: Comprehensive
- **Deployment**: Next release or hotfix if urgent

### Medium (P2)
- **Examples**: Minor feature broken, few users affected, workaround available
- **Response Time**: Within 1 day
- **Fix Timeline**: Within 1 week
- **Testing**: Standard
- **Deployment**: Next scheduled release

### Low (P3)
- **Examples**: Cosmetic issue, typo, minimal user impact
- **Response Time**: Within 1 week
- **Fix Timeline**: Next sprint
- **Testing**: Basic
- **Deployment**: Next scheduled release

## Checkpoints

| Checkpoint | Agent | Criteria |
|------------|-------|----------|
| After Step 1 | PM | Bug is understood and prioritized |
| After Step 2 | TA | Root cause is identified |
| After Step 4 | QA | Fix verified, no regressions |
| After Step 5 | PM | Bug closed and documented |

## Common Pitfalls

### Treating Symptoms, Not Root Cause
**Problem**: Adding null checks without understanding why value is null
**Solution**: Investigate why the value is null in the first place

### Scope Creep
**Problem**: Refactoring unrelated code while fixing bug
**Solution**: Fix only what's necessary; create separate tasks for improvements

### Insufficient Testing
**Problem**: Only testing the happy path, missing edge cases
**Solution**: Test edge cases, error paths, and similar scenarios

### Missing Regression Test
**Problem**: Fixing bug but not adding test to prevent recurrence
**Solution**: Always add regression test as part of the fix

### Incomplete Root Cause Analysis
**Problem**: Rushing to fix without full understanding
**Solution**: Take time to investigate thoroughly; ask TA for help

## Post-Fix Actions

After bug is fixed:

1. **Retrospective**: Why was the bug introduced? How can we prevent it?
2. **Documentation**: Update known issues, FAQs, troubleshooting guides
3. **Monitoring**: Add logging or monitoring to catch similar issues
4. **Prevention**: Update coding guidelines, add linting rules, improve tests
5. **Communication**: Inform users that bug is fixed

## Emergency Hotfix Procedure

For Critical (P0) bugs requiring immediate deployment:

1. **PM**: Declare hotfix mode, notify team
2. **TA**: Fast root cause analysis (< 30 min)
3. **FE**: Minimal fix implementation (< 1 hour)
4. **QA**: Critical path testing only (< 30 min)
5. **PM**: Deploy hotfix, monitor closely
6. **Follow-up**: Comprehensive testing post-deployment

---

**Remember**: A good bug fix is minimal, targeted, and well-tested. Always find the root cause before applying a fix.
