import type { Framework } from '../../types';

/**
 * NIST SP 800-218, Secure Software Development Framework (SSDF) v1.1.
 * 4 practice groups, modeled at practice level.
 */
export const ssdfFramework: Framework = {
  id: 'ssdf',
  name: 'NIST Secure Software Development Framework',
  shortName: 'NIST SSDF',
  version: 'SP 800-218',
  description:
    'A set of fundamental, sound, and secure software development practices organized into four groups that reduce vulnerabilities introduced during software development.',
  reference: 'https://csrc.nist.gov/pubs/sp/800/218/final',
  functions: [
    {
      id: 'ssdf-po',
      code: 'PO',
      name: 'Prepare the Organization',
      description:
        'Organizations ensure their people, processes, and technology are prepared to perform secure software development at the organization and project level.',
      controls: [
        {
          id: 'ssdf-po-1',
          code: 'PO.1',
          name: 'Define Security Requirements for Software Development',
          description:
            'Identify and document security requirements for software development so they can be considered throughout the SDLC.',
          guidance:
            'Capture requirements from regulations, business needs, and threat intelligence, and review them periodically.',
          question:
            'How do you define and keep current the security requirements that apply to your software development?',
          sampleAnswer:
            'We maintain a baseline security requirements catalog derived from regulations, customer contracts, and threat intelligence, reviewed and updated at least annually by the security architecture team.',
        },
        {
          id: 'ssdf-po-2',
          code: 'PO.2',
          name: 'Implement Roles and Responsibilities',
          description:
            'Ensure that everyone involved in secure software development knows their roles and responsibilities and has the necessary skills.',
          guidance:
            'Assign named owners for each secure development role and verify their training is current.',
          question:
            'How do you ensure everyone involved in development knows their secure-development responsibilities and has the skills to fulfill them?',
          sampleAnswer:
            'Each secure-development role (security champion, code reviewer, release approver) has a documented RACI entry and required training path, verified during onboarding and annual review.',
        },
        {
          id: 'ssdf-po-3',
          code: 'PO.3',
          name: 'Implement Supporting Toolchains',
          description:
            'Use automation to reduce human effort, improve accuracy, consistency, and reproducibility, and improve traceability of secure development processes.',
          guidance:
            'Standardize approved toolchains and secure the tools themselves against tampering.',
          question: 'How do you standardize and secure the toolchains used for development?',
          sampleAnswer:
            'We provide a centrally managed, approved toolchain (IDE plugins, CI/CD, dependency and static analysis scanners) with access controls and integrity verification, so teams aren’t building ad hoc, unvetted pipelines.',
        },
        {
          id: 'ssdf-po-4',
          code: 'PO.4',
          name: 'Define and Use Criteria for Software Security Checks',
          description:
            'Ensure that security requirements are conveyed to third parties and verified through defined criteria and gates.',
          guidance:
            'Define pass/fail gate criteria for each SDLC checkpoint and enforce them consistently.',
          question:
            'What criteria must software meet at each stage before it can progress (e.g., merge, release)?',
          sampleAnswer:
            'Each SDLC gate (PR merge, release candidate, production deploy) has documented pass/fail criteria — e.g., zero critical static-analysis findings, signed artifact — enforced automatically in the pipeline.',
        },
        {
          id: 'ssdf-po-5',
          code: 'PO.5',
          name: 'Implement and Maintain Secure Environments for Software Development',
          description:
            'Ensure all components of the development environments are strongly protected from internal and external threats.',
          guidance:
            'Segment and harden build, test, and production environments, and monitor them for unauthorized changes.',
          question: 'How are your development environments protected from compromise?',
          sampleAnswer:
            'Development, build, and test environments are network-segmented from production, access is role-based with multi-factor authentication, and environment configuration is monitored for unauthorized changes.',
        },
      ],
    },
    {
      id: 'ssdf-ps',
      code: 'PS',
      name: 'Protect the Software',
      description:
        'Organizations protect all components of their software from tampering and unauthorized access.',
      controls: [
        {
          id: 'ssdf-ps-1',
          code: 'PS.1',
          name: 'Protect All Forms of Code from Unauthorized Access and Tampering',
          description:
            'Prevent unauthorized changes to code, both in storage and in transit, to preserve its integrity.',
          guidance:
            'Enforce access controls and integrity verification (signing, checksums) on all repositories and artifacts.',
          question:
            'How do you prevent unauthorized changes to your source code and build artifacts?',
          sampleAnswer:
            'Source control requires signed commits and mandatory pull request review; build artifacts are checksummed and signed, with branch protection preventing direct pushes to main.',
        },
        {
          id: 'ssdf-ps-2',
          code: 'PS.2',
          name: 'Provide a Mechanism for Verifying Software Release Integrity',
          description:
            'Make software integrity verifiable by end users so they can confirm what they receive matches what was released.',
          guidance:
            'Digitally sign releases and publish verification instructions and checksums alongside them.',
          question:
            'How can a consumer verify that the software they received matches what you released?',
          sampleAnswer:
            'Every release is digitally signed and published with a checksum and software bill of materials, with verification instructions included in our release notes.',
        },
        {
          id: 'ssdf-ps-3',
          code: 'PS.3',
          name: 'Archive and Protect Each Software Release',
          description:
            'Preserve software releases and associated artifacts to support incident response, audits, and future maintenance.',
          guidance:
            'Retain build artifacts, SBOMs, and provenance data for each release in a tamper-evident archive.',
          question:
            'How do you preserve release artifacts and their provenance for future reference or incident response?',
          sampleAnswer:
            'We retain build artifacts, SBOMs, and provenance metadata for every release in a tamper-evident, access-controlled archive for a minimum of 3 years.',
        },
      ],
    },
    {
      id: 'ssdf-pw',
      code: 'PW',
      name: 'Produce Well-Secured Software',
      description:
        'Organizations produce well-secured software with minimal security vulnerabilities in its releases.',
      controls: [
        {
          id: 'ssdf-pw-1',
          code: 'PW.1',
          name: 'Design Software to Meet Security Requirements and Mitigate Security Risks',
          description:
            'Consider security requirements and risks during design so that they are addressed as early and cheaply as possible.',
          guidance:
            'Perform threat modeling at design time and document mitigations for identified risks.',
          question:
            'How do you address security requirements and risk during the design phase, before coding begins?',
          sampleAnswer:
            'Every feature design includes a threat-modeling step and explicit mapping to security requirements, documented in the design doc and reviewed before implementation starts.',
        },
        {
          id: 'ssdf-pw-2',
          code: 'PW.2',
          name: 'Review the Software Design to Verify Compliance with Security Requirements',
          description:
            'Confirm the software design satisfies its security requirements before implementation begins.',
          guidance:
            'Hold structured design reviews with security stakeholders and record sign-off.',
          question:
            'How is the design formally reviewed against security requirements before build starts?',
          sampleAnswer:
            'A security architect reviews each design document against the requirements catalog in a structured design review meeting, with sign-off recorded before development begins.',
        },
        {
          id: 'ssdf-pw-4',
          code: 'PW.4',
          name: 'Reuse Existing, Well-Secured Software When Feasible Instead of Duplicating Functionality',
          description:
            'Reduce risk and effort by reusing vetted, well-secured components rather than writing new, unproven code.',
          guidance:
            'Maintain an approved library of vetted components and prefer them over new custom implementations.',
          question:
            'How do you encourage reuse of vetted components instead of writing new security-sensitive code?',
          sampleAnswer:
            'We maintain an internal library of vetted, well-secured components (authentication, cryptography, input validation) that teams are required to use instead of writing their own, enforced via architecture review.',
        },
        {
          id: 'ssdf-pw-5',
          code: 'PW.5',
          name: 'Create Source Code Consistent with Secure Coding Practices',
          description:
            'Reduce the number of security vulnerabilities introduced during code creation by following secure coding standards.',
          guidance:
            'Adopt language-specific secure coding standards and enforce them through linting and peer review.',
          question:
            'What secure coding standards do developers follow, and how is adherence enforced?',
          sampleAnswer:
            'We maintain language-specific secure coding standards enforced via linting rules in CI and mandatory peer review, with training refreshed after any standard update.',
        },
        {
          id: 'ssdf-pw-6',
          code: 'PW.6',
          name: 'Configure the Compilation, Interpreter, and Build Processes to Improve Executable Security',
          description:
            'Reduce exploitable weaknesses by using compiler and build settings that enable available security protections.',
          guidance:
            'Enable hardening flags (stack protection, ASLR, warnings-as-errors) as standard build configuration.',
          question: 'What compiler/build hardening settings are applied by default?',
          sampleAnswer:
            'Our build templates enable stack protection, address space layout randomization, and treat compiler warnings as errors by default; teams must justify and get approval for any deviation.',
        },
        {
          id: 'ssdf-pw-7',
          code: 'PW.7',
          name: 'Review and/or Analyze Human-Readable Code to Identify Vulnerabilities',
          description:
            'Find vulnerabilities not easily found by automated tools through manual and tool-assisted code review.',
          guidance:
            'Require peer code review with a security checklist and use static analysis to supplement it.',
          question: 'How is code reviewed for vulnerabilities beyond automated tooling?',
          sampleAnswer:
            'Every pull request requires at least one peer review using a security checklist, supplemented by static analysis results surfaced directly in the review tool before merge is allowed.',
        },
        {
          id: 'ssdf-pw-8',
          code: 'PW.8',
          name: 'Test Executable Code to Identify Vulnerabilities and Verify Compliance',
          description:
            'Find vulnerabilities that were not identified by earlier reviews, analysis, or testing through dynamic testing.',
          guidance:
            'Run dynamic application security testing and fuzzing against realistic staging environments.',
          question: 'How do you dynamically test running code for vulnerabilities?',
          sampleAnswer:
            'We run dynamic application security testing and fuzz testing against staging on every release candidate, with any high or critical finding blocking promotion to production.',
        },
        {
          id: 'ssdf-pw-9',
          code: 'PW.9',
          name: 'Configure Software to Have Secure Settings by Default',
          description:
            'Help end users deploy the software securely by shipping secure default configurations.',
          guidance:
            'Ship the most secure configuration by default and document any deviation required for functionality.',
          question: 'How do you ensure the software ships with secure defaults out of the box?',
          sampleAnswer:
            'Our configuration templates default to the most secure setting (e.g., authentication required, TLS enforced, verbose errors disabled); any less-secure override requires documented justification and approval.',
        },
      ],
    },
    {
      id: 'ssdf-rv',
      code: 'RV',
      name: 'Respond to Vulnerabilities',
      description:
        'Organizations identify residual vulnerabilities in their software releases and respond appropriately to address those vulnerabilities and prevent similar ones from occurring in the future.',
      controls: [
        {
          id: 'ssdf-rv-1',
          code: 'RV.1',
          name: 'Identify and Confirm Vulnerabilities on an Ongoing Basis',
          description:
            'Continuously gather and validate vulnerability information from internal testing, external researchers, and threat intelligence.',
          guidance:
            'Operate a vulnerability disclosure or bug bounty program and monitor advisories for used components.',
          question: 'How do you continuously discover new vulnerabilities affecting your software?',
          sampleAnswer:
            'We run a public vulnerability disclosure program, subscribe to advisories for all direct and transitive dependencies, and run continuous software composition analysis to flag newly disclosed CVEs.',
        },
        {
          id: 'ssdf-rv-2',
          code: 'RV.2',
          name: 'Assess, Prioritize, and Remediate Vulnerabilities',
          description:
            'Analyze confirmed vulnerabilities to determine risk and remediate them within a timeframe commensurate with that risk.',
          guidance:
            'Score vulnerabilities (e.g., CVSS) and enforce remediation SLAs based on exploitability and exposure.',
          question: 'How do you decide what to fix first, and within what timeframe?',
          sampleAnswer:
            'Vulnerabilities are scored with CVSS plus exploitability/exposure context, with SLAs of 7/30/90 days for critical/high/medium severity, tracked to closure in our vulnerability management tool.',
        },
        {
          id: 'ssdf-rv-3',
          code: 'RV.3',
          name: 'Analyze Vulnerabilities to Identify Their Root Causes',
          description:
            'Analyze identified vulnerabilities to determine their root causes so similar vulnerabilities can be prevented in the future.',
          guidance:
            'Feed root-cause findings back into secure coding standards, training, and tooling to prevent recurrence.',
          question:
            'How do you ensure the same class of vulnerability doesn’t keep recurring?',
          sampleAnswer:
            'Each critical/high vulnerability gets a root-cause analysis; recurring patterns (e.g., missing output encoding) are converted into a new linting rule or training module within the same quarter.',
        },
      ],
    },
  ],
};
