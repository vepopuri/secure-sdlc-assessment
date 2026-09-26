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
        },
        {
          id: 'ssdf-po-2',
          code: 'PO.2',
          name: 'Implement Roles and Responsibilities',
          description:
            'Ensure that everyone involved in secure software development knows their roles and responsibilities and has the necessary skills.',
          guidance:
            'Assign named owners for each secure development role and verify their training is current.',
        },
        {
          id: 'ssdf-po-3',
          code: 'PO.3',
          name: 'Implement Supporting Toolchains',
          description:
            'Use automation to reduce human effort, improve accuracy, consistency, and reproducibility, and improve traceability of secure development processes.',
          guidance:
            'Standardize approved toolchains and secure the tools themselves against tampering.',
        },
        {
          id: 'ssdf-po-4',
          code: 'PO.4',
          name: 'Define and Use Criteria for Software Security Checks',
          description:
            'Ensure that security requirements are conveyed to third parties and verified through defined criteria and gates.',
          guidance:
            'Define pass/fail gate criteria for each SDLC checkpoint and enforce them consistently.',
        },
        {
          id: 'ssdf-po-5',
          code: 'PO.5',
          name: 'Implement and Maintain Secure Environments for Software Development',
          description:
            'Ensure all components of the development environments are strongly protected from internal and external threats.',
          guidance:
            'Segment and harden build, test, and production environments, and monitor them for unauthorized changes.',
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
        },
        {
          id: 'ssdf-ps-2',
          code: 'PS.2',
          name: 'Provide a Mechanism for Verifying Software Release Integrity',
          description:
            'Make software integrity verifiable by end users so they can confirm what they receive matches what was released.',
          guidance:
            'Digitally sign releases and publish verification instructions and checksums alongside them.',
        },
        {
          id: 'ssdf-ps-3',
          code: 'PS.3',
          name: 'Archive and Protect Each Software Release',
          description:
            'Preserve software releases and associated artifacts to support incident response, audits, and future maintenance.',
          guidance:
            'Retain build artifacts, SBOMs, and provenance data for each release in a tamper-evident archive.',
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
        },
        {
          id: 'ssdf-pw-2',
          code: 'PW.2',
          name: 'Review the Software Design to Verify Compliance with Security Requirements',
          description:
            'Confirm the software design satisfies its security requirements before implementation begins.',
          guidance:
            'Hold structured design reviews with security stakeholders and record sign-off.',
        },
        {
          id: 'ssdf-pw-4',
          code: 'PW.4',
          name: 'Reuse Existing, Well-Secured Software When Feasible Instead of Duplicating Functionality',
          description:
            'Reduce risk and effort by reusing vetted, well-secured components rather than writing new, unproven code.',
          guidance:
            'Maintain an approved library of vetted components and prefer them over new custom implementations.',
        },
        {
          id: 'ssdf-pw-5',
          code: 'PW.5',
          name: 'Create Source Code Consistent with Secure Coding Practices',
          description:
            'Reduce the number of security vulnerabilities introduced during code creation by following secure coding standards.',
          guidance:
            'Adopt language-specific secure coding standards and enforce them through linting and peer review.',
        },
        {
          id: 'ssdf-pw-6',
          code: 'PW.6',
          name: 'Configure the Compilation, Interpreter, and Build Processes to Improve Executable Security',
          description:
            'Reduce exploitable weaknesses by using compiler and build settings that enable available security protections.',
          guidance:
            'Enable hardening flags (stack protection, ASLR, warnings-as-errors) as standard build configuration.',
        },
        {
          id: 'ssdf-pw-7',
          code: 'PW.7',
          name: 'Review and/or Analyze Human-Readable Code to Identify Vulnerabilities',
          description:
            'Find vulnerabilities not easily found by automated tools through manual and tool-assisted code review.',
          guidance:
            'Require peer code review with a security checklist and use static analysis to supplement it.',
        },
        {
          id: 'ssdf-pw-8',
          code: 'PW.8',
          name: 'Test Executable Code to Identify Vulnerabilities and Verify Compliance',
          description:
            'Find vulnerabilities that were not identified by earlier reviews, analysis, or testing through dynamic testing.',
          guidance:
            'Run dynamic application security testing and fuzzing against realistic staging environments.',
        },
        {
          id: 'ssdf-pw-9',
          code: 'PW.9',
          name: 'Configure Software to Have Secure Settings by Default',
          description:
            'Help end users deploy the software securely by shipping secure default configurations.',
          guidance:
            'Ship the most secure configuration by default and document any deviation required for functionality.',
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
        },
        {
          id: 'ssdf-rv-2',
          code: 'RV.2',
          name: 'Assess, Prioritize, and Remediate Vulnerabilities',
          description:
            'Analyze confirmed vulnerabilities to determine risk and remediate them within a timeframe commensurate with that risk.',
          guidance:
            'Score vulnerabilities (e.g., CVSS) and enforce remediation SLAs based on exploitability and exposure.',
        },
        {
          id: 'ssdf-rv-3',
          code: 'RV.3',
          name: 'Analyze Vulnerabilities to Identify Their Root Causes',
          description:
            'Analyze identified vulnerabilities to determine their root causes so similar vulnerabilities can be prevented in the future.',
          guidance:
            'Feed root-cause findings back into secure coding standards, training, and tooling to prevent recurrence.',
        },
      ],
    },
  ],
};
