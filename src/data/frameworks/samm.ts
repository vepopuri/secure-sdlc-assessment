import type { Framework } from '../../types';

/**
 * OWASP SAMM v2 (Software Assurance Maturity Model).
 * 5 business functions -> 3 practices each -> 2 streams (A/B) each, modeled as controls.
 */
export const sammFramework: Framework = {
  id: 'samm',
  name: 'OWASP Software Assurance Maturity Model',
  shortName: 'SAMM',
  version: 'v2',
  description:
    'An open framework for measuring and improving an organization’s software security posture across the SDLC through five business functions, each with three practices.',
  reference: 'https://owaspsamm.org/model/',
  functions: [
    {
      id: 'samm-governance',
      code: 'GOV',
      name: 'Governance',
      description:
        'The practices an organization uses to manage software assurance activities, objectives, and risk overall.',
      controls: [
        {
          id: 'samm-sm-a',
          code: 'SM-A',
          name: 'Strategy & Metrics: Strategy',
          description:
            'Establish a risk-driven, unified strategic roadmap for software security aligned with the organization’s risk tolerance and business drivers.',
          guidance:
            'Define a strategy owner, articulate risk appetite, and publish a roadmap that ties security investment to measurable business risk.',
        },
        {
          id: 'samm-sm-b',
          code: 'SM-B',
          name: 'Strategy & Metrics: Metrics',
          description:
            'Define and collect security metrics that give objective insight into the effectiveness of the software assurance program.',
          guidance:
            'Track leading and lagging indicators (e.g., defect density, time-to-remediate) and report them to stakeholders on a regular cadence.',
        },
        {
          id: 'samm-pc-a',
          code: 'PC-A',
          name: 'Policy & Compliance: Policy & Standards',
          description:
            'Establish and maintain policies and standards that codify security expectations for software development activities.',
          guidance:
            'Derive policies from regulatory, contractual, and business requirements, and keep them versioned and accessible to development teams.',
        },
        {
          id: 'samm-pc-b',
          code: 'PC-B',
          name: 'Policy & Compliance: Compliance Management',
          description:
            'Identify applicable compliance drivers and systematically verify that software meets them across its lifecycle.',
          guidance:
            'Maintain a compliance register mapping regulations/standards to controls and evidence, and audit adherence periodically.',
        },
        {
          id: 'samm-eg-a',
          code: 'EG-A',
          name: 'Education & Guidance: Training & Awareness',
          description:
            'Provide role-specific security training so that everyone involved in the software lifecycle understands their responsibilities.',
          guidance:
            'Tailor training tracks by role (developer, architect, tester) and refresh content as threats and technology stacks evolve.',
        },
        {
          id: 'samm-eg-b',
          code: 'EG-B',
          name: 'Education & Guidance: Organization & Culture',
          description:
            'Build a security-aware culture through champion programs, incentives, and organizational structures that reinforce secure behavior.',
          guidance:
            'Establish a security champions network and recognize teams that demonstrate strong secure-development practices.',
        },
      ],
    },
    {
      id: 'samm-design',
      code: 'DES',
      name: 'Design',
      description:
        'The practices used to define, refine, and validate the security requirements and architecture of software before it is built.',
      controls: [
        {
          id: 'samm-ta-a',
          code: 'TA-A',
          name: 'Threat Assessment: Application Risk Profile',
          description:
            'Determine and maintain a risk profile for each application to prioritize subsequent assurance activities.',
          guidance:
            'Score applications by data sensitivity, exposure, and business criticality to drive proportionate security investment.',
        },
        {
          id: 'samm-ta-b',
          code: 'TA-B',
          name: 'Threat Assessment: Threat Modeling',
          description:
            'Identify and evaluate application-specific threats to guide design decisions and risk treatment.',
          guidance:
            'Run structured threat modeling (e.g., STRIDE) at design time and whenever the architecture materially changes.',
        },
        {
          id: 'samm-sr-a',
          code: 'SR-A',
          name: 'Security Requirements: Software Requirements',
          description:
            'Integrate security requirements into the software requirements process so they are treated as first-class functional needs.',
          guidance:
            'Maintain a reusable catalog of security requirements mapped to common risk categories and legal obligations.',
        },
        {
          id: 'samm-sr-b',
          code: 'SR-B',
          name: 'Security Requirements: Supplier Security',
          description:
            'Establish security expectations and verification for third-party and open-source components used in the software supply chain.',
          guidance:
            'Include security clauses in supplier contracts and assess third-party components before adoption.',
        },
        {
          id: 'samm-sa-a',
          code: 'SA-A',
          name: 'Security Architecture: Architecture Design',
          description:
            'Provide architectural guidance and reusable security services that constrain and simplify secure design decisions.',
          guidance:
            'Publish reference architectures and secure design patterns for common application types.',
        },
        {
          id: 'samm-sa-b',
          code: 'SA-B',
          name: 'Security Architecture: Technology Management',
          description:
            'Direct the selection and lifecycle management of technologies to limit the introduction of unnecessary risk.',
          guidance:
            'Maintain an approved technology catalog and retire unsupported frameworks and libraries on a schedule.',
        },
      ],
    },
    {
      id: 'samm-implementation',
      code: 'IMPL',
      name: 'Implementation',
      description:
        'The practices related to how an organization builds and deploys software components and manages defects found along the way.',
      controls: [
        {
          id: 'samm-sb-a',
          code: 'SB-A',
          name: 'Secure Build: Build Process',
          description:
            'Ensure the build process is repeatable, automated, and hardened against tampering.',
          guidance:
            'Use immutable, versioned build pipelines with restricted access to build configuration.',
        },
        {
          id: 'samm-sb-b',
          code: 'SB-B',
          name: 'Secure Build: Software Dependencies',
          description:
            'Track and manage the security of third-party and open-source dependencies pulled into the build.',
          guidance:
            'Generate a software bill of materials (SBOM) and continuously scan dependencies for known vulnerabilities.',
        },
        {
          id: 'samm-sd-a',
          code: 'SD-A',
          name: 'Secure Deployment: Deployment Process',
          description:
            'Ensure software is deployed through a repeatable, auditable process that minimizes the risk of insecure configuration.',
          guidance:
            'Automate deployment with infrastructure-as-code and require approvals for changes to production environments.',
        },
        {
          id: 'samm-sd-b',
          code: 'SD-B',
          name: 'Secure Deployment: Secret Management',
          description:
            'Protect secrets (keys, credentials, tokens) used during build and deployment from exposure or misuse.',
          guidance:
            'Store secrets in a dedicated vault, rotate them regularly, and never commit them to source control.',
        },
        {
          id: 'samm-dm-a',
          code: 'DM-A',
          name: 'Defect Management: Defect Tracking',
          description:
            'Systematically capture security defects found through any channel in a central tracking system.',
          guidance:
            'Route findings from testing, bug bounty, and production incidents into one triage queue with consistent severity ratings.',
        },
        {
          id: 'samm-dm-b',
          code: 'DM-B',
          name: 'Defect Management: Defect Response',
          description:
            'Define and follow remediation timelines and root-cause analysis for tracked security defects.',
          guidance:
            'Set SLA targets by severity and analyze recurring defect classes to fix systemic causes.',
        },
      ],
    },
    {
      id: 'samm-verification',
      code: 'VER',
      name: 'Verification',
      description:
        'The practices used to assess and test artifacts and processes to ensure security requirements have been met.',
      controls: [
        {
          id: 'samm-aa-a',
          code: 'AA-A',
          name: 'Architecture Assessment: Architecture Validation',
          description:
            'Validate that the implemented architecture conforms to the intended secure design.',
          guidance:
            'Perform periodic architecture reviews against reference designs and threat models.',
        },
        {
          id: 'samm-aa-b',
          code: 'AA-B',
          name: 'Architecture Assessment: Architecture Mitigation',
          description:
            'Identify and remediate architectural weaknesses discovered during assessment.',
          guidance:
            'Track architectural findings alongside code-level defects and prioritize by exploitability.',
        },
        {
          id: 'samm-rt-a',
          code: 'RT-A',
          name: 'Requirements-driven Testing: Control Verification',
          description:
            'Verify that specified security controls and requirements are correctly implemented through targeted testing.',
          guidance:
            'Maintain test cases traceable to each documented security requirement.',
        },
        {
          id: 'samm-rt-b',
          code: 'RT-B',
          name: 'Requirements-driven Testing: Misuse/Abuse Testing',
          description:
            'Test how the application behaves under intentional misuse or abuse scenarios derived from threat models.',
          guidance:
            'Design abuse-case test scripts alongside functional test cases for high-risk features.',
        },
        {
          id: 'samm-st-a',
          code: 'ST-A',
          name: 'Security Testing: Scalable Baseline',
          description:
            'Apply automated, scalable security testing (e.g., SAST/DAST) broadly across the portfolio.',
          guidance:
            'Integrate baseline scanning into CI pipelines so every build is tested consistently.',
        },
        {
          id: 'samm-st-b',
          code: 'ST-B',
          name: 'Security Testing: Deep Understanding',
          description:
            'Perform deep, manual security testing (e.g., penetration testing) on high-risk applications.',
          guidance:
            'Commission expert-led testing for applications with the highest risk profile at least annually.',
        },
      ],
    },
    {
      id: 'samm-operations',
      code: 'OPS',
      name: 'Operations',
      description:
        'The practices used to maintain assurance for deployed software throughout its operational lifetime.',
      controls: [
        {
          id: 'samm-im-a',
          code: 'IM-A',
          name: 'Incident Management: Incident Detection',
          description:
            'Detect security incidents affecting deployed software in a timely manner.',
          guidance:
            'Centralize logging and alerting so anomalous behavior is surfaced quickly to responders.',
        },
        {
          id: 'samm-im-b',
          code: 'IM-B',
          name: 'Incident Management: Incident Response',
          description:
            'Respond to and recover from security incidents through a defined, rehearsed process.',
          guidance:
            'Maintain an incident response plan with clear roles, and run tabletop exercises periodically.',
        },
        {
          id: 'samm-em-a',
          code: 'EM-A',
          name: 'Environment Management: Configuration Hardening',
          description:
            'Harden the configuration of runtime environments to reduce the attack surface of deployed software.',
          guidance:
            'Apply baseline hardening standards (e.g., CIS benchmarks) to all production environments.',
        },
        {
          id: 'samm-em-b',
          code: 'EM-B',
          name: 'Environment Management: Patching & Vulnerability Management',
          description:
            'Identify and remediate vulnerabilities in the operational environment through timely patching.',
          guidance:
            'Run continuous vulnerability scanning and enforce patch SLAs based on severity.',
        },
        {
          id: 'samm-om-a',
          code: 'OM-A',
          name: 'Operational Management: Data Protection',
          description:
            'Protect the confidentiality and integrity of sensitive data throughout its operational lifecycle.',
          guidance:
            'Classify data, encrypt it at rest and in transit, and enforce least-privilege access.',
        },
        {
          id: 'samm-om-b',
          code: 'OM-B',
          name: 'Operational Management: Legacy Management',
          description:
            'Manage the risk of legacy and end-of-life software components still in operation.',
          guidance:
            'Maintain an inventory of legacy systems with compensating controls and a decommissioning plan.',
        },
      ],
    },
  ],
};
