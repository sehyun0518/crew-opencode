# SOP: Feature Development

**Standard Operating Procedure for implementing new features**

---

## Overview

This SOP defines the structured workflow for developing new features in a project. It ensures that features are well-researched, properly designed, correctly implemented, thoroughly tested, and approved before completion.

## Objectives

- Deliver high-quality, well-tested features
- Ensure proper planning before implementation
- Maintain consistency with existing architecture
- Achieve ≥80% test coverage
- Prevent scope creep and technical debt

## Required Agents

- **PM** (Project Manager) - Orchestration and approval
- **TA** (Technical Analyst) - Research and specifications
- **Design** (Designer) - UX/UI design
- **FE** (UI/UX Engineer) - Implementation
- **QA** (Quality Assurance) - Testing and verification

## Workflow Steps

### Step 1: Requirements Analysis & Planning
**Agent**: PM (Project Manager)
**Priority**: Critical
**Estimated Time**: 10-15 minutes

**Inputs**:
- `user_request` - The feature request from the user
- `project_context` - Current project state and architecture

**Actions**:
1. Parse and understand the user's request
2. Identify ambiguities and ask clarifying questions
3. Break down requirements into actionable tasks
4. Create execution plan with task dependencies
5. Identify risks and mitigation strategies
6. Set success criteria

**Outputs**:
- `execution_plan` - Detailed plan with task assignments
- `task_breakdown` - Individual tasks with priorities
- `success_criteria` - Measurable criteria for completion

**Validation**:
- All requirements are clearly understood
- Execution plan covers all aspects of the feature
- Dependencies are identified
- Success criteria are measurable

**Checkpoint**: PM must approve execution plan before proceeding

---

### Step 2A: Technical Research & Specification (Parallel)
**Agent**: TA (Technical Analyst)
**Priority**: High
**Estimated Time**: 15-20 minutes

**Inputs**:
- `execution_plan` - Plan from PM
- `codebase` - Existing codebase

**Actions**:
1. Research relevant documentation and best practices
2. Analyze existing codebase for patterns
3. Identify integration points
4. Design data structures and APIs
5. Specify implementation approach
6. Document edge cases and error handling

**Outputs**:
- `technical_spec` - Detailed technical specification
- `architecture_recommendations` - How this fits into existing architecture

**Validation**:
- Technical spec is complete and actionable
- All edge cases are identified
- Integration points are clearly defined
- Approach aligns with existing patterns

**Parallel With**: Step 2B (Design Review)

---

### Step 2B: UX/UI Design Review (Parallel)
**Agent**: Design (Designer)
**Priority**: High
**Estimated Time**: 10-15 minutes

**Inputs**:
- `execution_plan` - Plan from PM
- `user_requirements` - Feature requirements

**Actions**:
1. Review user flows and journeys
2. Propose component hierarchy
3. Design UI specifications
4. Ensure accessibility compliance
5. Create design tokens and guidelines
6. Validate design feasibility

**Outputs**:
- `design_spec` - UI/UX design specification
- `component_hierarchy` - Component structure

**Validation**:
- Design is consistent with existing UI
- Accessibility requirements are met
- Component hierarchy is logical
- Design is implementable

**Parallel With**: Step 2A (Technical Research)

**Checkpoint**: Both TA and Design specs must be complete before proceeding

---

### Step 3: Feature Implementation
**Agent**: FE (UI/UX Engineer)
**Priority**: Critical
**Estimated Time**: 20-30 minutes

**Inputs**:
- `technical_spec` - Technical specification from TA
- `design_spec` - Design specification from Design

**Actions**:
1. Review both technical and design specs
2. Create component structure
3. Implement core functionality
4. Add styling and interactions
5. Integrate with APIs/backend
6. Handle edge cases and errors
7. Ensure accessibility compliance
8. Optimize performance

**Outputs**:
- `implementation_code` - Implemented feature code
- `components` - Created/modified components

**Validation**:
- Code follows project conventions
- TypeScript compiles without errors
- Implementation matches both specs
- Error handling is complete
- Accessibility standards are met
- Code is clean and maintainable

---

### Step 4: Testing & Quality Verification
**Agent**: QA (Quality Assurance)
**Priority**: Critical
**Estimated Time**: 15-25 minutes

**Inputs**:
- `implementation_code` - Code from FE
- `technical_spec` - Technical spec from TA

**Actions**:
1. Write unit tests for components and functions
2. Create integration tests for workflows
3. Develop E2E tests for critical user flows
4. Run all tests and analyze results
5. Measure code coverage
6. Identify and report bugs
7. Verify edge cases are handled
8. Perform regression testing

**Outputs**:
- `test_files` - Test suite for the feature
- `coverage_report` - Code coverage analysis
- `quality_assessment` - Overall quality report

**Validation**:
- All tests pass
- Coverage ≥ 80%
- Critical user flows have E2E tests
- No critical or high-severity bugs
- Edge cases are tested

**Quality Gate**: QA must approve before final review

---

### Step 5: Final Review & Approval
**Agent**: PM (Project Manager)
**Priority**: Critical
**Estimated Time**: 5-10 minutes

**Inputs**:
- `implementation_code` - Implemented feature
- `test_files` - Test suite
- `quality_assessment` - QA report

**Actions**:
1. Review all deliverables
2. Verify success criteria are met
3. Check test coverage and quality
4. Ensure requirements are fully satisfied
5. Validate no scope creep
6. Sign off on completion

**Outputs**:
- `final_summary` - Summary of completed work
- `completion_status` - Approval or rejection

**Validation**:
- All success criteria met
- Quality standards satisfied
- Tests pass with ≥80% coverage
- No critical issues remain
- User requirements fully addressed

**Final Checkpoint**: PM approval required for completion

---

## Success Criteria

The feature development is successful when:

- ✅ All steps completed without critical failures
- ✅ Test coverage ≥ 80%
- ✅ All tests passing
- ✅ Code follows project standards
- ✅ User requirements fully met
- ✅ No critical or high-severity bugs
- ✅ Documentation is complete
- ✅ PM has given final approval

## Failure Handling

If any step fails:

1. **Generate Incident Report**: Agent creates Apology Letter
2. **Analyze Root Cause**: Determine why the step failed
3. **Decide on Action**:
   - **Recoverable**: Retry the step (up to max retries)
   - **Not Recoverable**: Escalate to PM for decision
4. **Update Plan**: PM adjusts execution plan if needed
5. **Communicate**: Inform user of significant delays

## Time Estimates

| Step | Agent | Estimated Time |
|------|-------|----------------|
| 1. Planning | PM | 10-15 min |
| 2A. Technical Research | TA | 15-20 min |
| 2B. Design Review | Design | 10-15 min |
| 3. Implementation | FE | 20-30 min |
| 4. Testing | QA | 15-25 min |
| 5. Final Review | PM | 5-10 min |

**Total Estimated Time**: 60-90 minutes

**Critical Path**: Steps 1 → 2A/2B → 3 → 4 → 5

## Best Practices

### DO:
- ✅ Follow the SOP strictly - no skipping steps
- ✅ Complete checkpoints before proceeding
- ✅ Communicate blockers immediately
- ✅ Ask clarifying questions early
- ✅ Test thoroughly at each stage
- ✅ Document decisions and trade-offs

### DON'T:
- ❌ Skip planning or design phases
- ❌ Implement before specs are complete
- ❌ Accept low test coverage
- ❌ Ignore quality gates
- ❌ Rush through steps
- ❌ Deviate from the plan without PM approval

## Checkpoints

| Checkpoint | Agent | Criteria |
|------------|-------|----------|
| After Step 1 | PM | Execution plan approved |
| After Step 2 | PM | Both specs complete and approved |
| After Step 4 | QA | Quality gate passed (≥80% coverage, all tests pass) |
| After Step 5 | PM | Final approval given |

## Variations

### Small Features (< 100 lines)
- May combine Steps 2A and 2B into single spec
- Reduce estimation time by 30-40%

### Large Features (> 500 lines)
- Break into multiple iterations
- Add additional checkpoints
- Consider phased rollout

### UI-Only Features
- Design step is more critical
- May reduce TA involvement
- Focus on frontend testing

### Backend-Only Features
- May skip Design step
- TA and FE steps merged
- Focus on integration testing

---

**Remember**: This SOP ensures quality and consistency. Following it prevents technical debt and reduces bugs.
