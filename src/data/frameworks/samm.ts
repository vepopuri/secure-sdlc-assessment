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
          question:
            'What is your documented application security strategy, and who is accountable for it?',
          sampleAnswer:
            'We maintain a 3-year AppSec roadmap owned by the CISO, aligned to business risk appetite, reviewed with executive leadership twice a year, with a named program owner and board-level visibility.',
        },
        {
          id: 'samm-sm-b',
          code: 'SM-B',
          name: 'Strategy & Metrics: Metrics',
          description:
            'Define and collect security metrics that give objective insight into the effectiveness of the software assurance program.',
          guidance:
            'Track leading and lagging indicators (e.g., defect density, time-to-remediate) and report them to stakeholders on a regular cadence.',
          question: 'What security metrics do you track, and how are they used to drive decisions?',
          sampleAnswer:
            'We track defect density, mean time-to-remediate, and percentage of applications with a current threat model, reported monthly to engineering leads and quarterly to the CISO, with targets tied to release gates.',
        },
        {
          id: 'samm-pc-a',
          code: 'PC-A',
          name: 'Policy & Compliance: Policy & Standards',
          description:
            'Establish and maintain policies and standards that codify security expectations for software development activities.',
          guidance:
            'Derive policies from regulatory, contractual, and business requirements, and keep them versioned and accessible to development teams.',
          question:
            'What security policies and coding standards apply to development, and how are they kept current?',
          sampleAnswer:
            'We maintain a secure development policy and language-specific coding standards in our internal wiki, reviewed annually by the security team and updated after each major incident or new regulatory requirement.',
        },
        {
          id: 'samm-pc-b',
          code: 'PC-B',
          name: 'Policy & Compliance: Compliance Management',
          description:
            'Identify applicable compliance drivers and systematically verify that software meets them across its lifecycle.',
          guidance:
            'Maintain a compliance register mapping regulations/standards to controls and evidence, and audit adherence periodically.',
          question:
            'How do you track which regulatory or contractual requirements apply to each application, and verify you meet them?',
          sampleAnswer:
            'We maintain a compliance register mapping each application to its applicable regulations (e.g., PCI DSS, GDPR), with control evidence collected and reviewed during an annual internal audit.',
        },
        {
          id: 'samm-eg-a',
          code: 'EG-A',
          name: 'Education & Guidance: Training & Awareness',
          description:
            'Provide role-specific security training so that everyone involved in the software lifecycle understands their responsibilities.',
          guidance:
            'Tailor training tracks by role (developer, architect, tester) and refresh content as threats and technology stacks evolve.',
          question: 'What security training do developers receive, and how often?',
          sampleAnswer:
            'All engineers complete role-based secure coding training annually (OWASP Top 10, language-specific modules) plus a mandatory onboarding module, tracked in our LMS with completion rates reported to managers.',
        },
        {
          id: 'samm-eg-b',
          code: 'EG-B',
          name: 'Education & Guidance: Organization & Culture',
          description:
            'Build a security-aware culture through champion programs, incentives, and organizational structures that reinforce secure behavior.',
          guidance:
            'Establish a security champions network and recognize teams that demonstrate strong secure-development practices.',
          question: 'How do you build a security-aware culture beyond formal training?',
          sampleAnswer:
            'We run a security champions program with one champion per team, a monthly internal newsletter highlighting recent findings, and recognition awards for proactively reported issues.',
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
          question:
            'How do you determine the risk level of an application, and how does that drive assurance activities?',
          sampleAnswer:
            'Each application is scored at intake using a risk questionnaire (data sensitivity, exposure, user count), producing a High/Medium/Low rating that determines the depth of testing and review required before release.',
        },
        {
          id: 'samm-ta-b',
          code: 'TA-B',
          name: 'Threat Assessment: Threat Modeling',
          description:
            'Identify and evaluate application-specific threats to guide design decisions and risk treatment.',
          guidance:
            'Run structured threat modeling (e.g., STRIDE) at design time and whenever the architecture materially changes.',
          question: 'Do you perform threat modeling, and at what point in the lifecycle?',
          sampleAnswer:
            'We run STRIDE-based threat modeling workshops at design time for all high-risk applications and whenever the architecture changes materially, with findings tracked to closure in the backlog.',
        },
        {
          id: 'samm-sr-a',
          code: 'SR-A',
          name: 'Security Requirements: Software Requirements',
          description:
            'Integrate security requirements into the software requirements process so they are treated as first-class functional needs.',
          guidance:
            'Maintain a reusable catalog of security requirements mapped to common risk categories and legal obligations.',
          question: 'How are security requirements captured alongside functional requirements?',
          sampleAnswer:
            'Our requirements template includes a mandatory security section populated from a reusable catalog mapped to risk categories (authentication, authorization, data protection, etc.), reviewed by security before sprint planning.',
        },
        {
          id: 'samm-sr-b',
          code: 'SR-B',
          name: 'Security Requirements: Supplier Security',
          description:
            'Establish security expectations and verification for third-party and open-source components used in the software supply chain.',
          guidance:
            'Include security clauses in supplier contracts and assess third-party components before adoption.',
          question:
            'How do you assess the security of third-party components and vendors before adoption?',
          sampleAnswer:
            'New third-party libraries go through an automated vulnerability/license scan, and vendors handling sensitive data complete a security questionnaire and, for critical vendors, an on-site or virtual assessment.',
        },
        {
          id: 'samm-sa-a',
          code: 'SA-A',
          name: 'Security Architecture: Architecture Design',
          description:
            'Provide architectural guidance and reusable security services that constrain and simplify secure design decisions.',
          guidance:
            'Publish reference architectures and secure design patterns for common application types.',
          question:
            'What reference architectures or design patterns do teams use to build securely by default?',
          sampleAnswer:
            'We publish reference architectures for common patterns (web app, API gateway, event pipeline) with security controls baked in, and architecture review board sign-off is required before a new pattern is adopted.',
        },
        {
          id: 'samm-sa-b',
          code: 'SA-B',
          name: 'Security Architecture: Technology Management',
          description:
            'Direct the selection and lifecycle management of technologies to limit the introduction of unnecessary risk.',
          guidance:
            'Maintain an approved technology catalog and retire unsupported frameworks and libraries on a schedule.',
          question:
            'How do you manage which technologies/frameworks are approved for use, and retire outdated ones?',
          sampleAnswer:
            'We maintain an approved technology catalog with version support windows; unsupported frameworks trigger an automatic ticket and a 90-day remediation SLA.',
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
          question: 'How is your build process automated and protected from tampering?',
          sampleAnswer:
            'Builds run in an immutable, versioned CI pipeline with restricted write access to pipeline configuration, signed build artifacts, and no manual production build steps.',
        },
        {
          id: 'samm-sb-b',
          code: 'SB-B',
          name: 'Secure Build: Software Dependencies',
          description:
            'Track and manage the security of third-party and open-source dependencies pulled into the build.',
          guidance:
            'Generate a software bill of materials (SBOM) and continuously scan dependencies for known vulnerabilities.',
          question: 'How do you track and remediate vulnerable dependencies?',
          sampleAnswer:
            'Every build generates an SBOM and runs software composition analysis; critical vulnerabilities block the build and are remediated within 7 days per policy.',
        },
        {
          id: 'samm-sd-a',
          code: 'SD-A',
          name: 'Secure Deployment: Deployment Process',
          description:
            'Ensure software is deployed through a repeatable, auditable process that minimizes the risk of insecure configuration.',
          guidance:
            'Automate deployment with infrastructure-as-code and require approvals for changes to production environments.',
          question: 'How is deployment to production controlled and audited?',
          sampleAnswer:
            'Deployments use infrastructure-as-code through a gated CD pipeline requiring peer approval, with all changes logged and traceable to a ticket and commit.',
        },
        {
          id: 'samm-sd-b',
          code: 'SD-B',
          name: 'Secure Deployment: Secret Management',
          description:
            'Protect secrets (keys, credentials, tokens) used during build and deployment from exposure or misuse.',
          guidance:
            'Store secrets in a dedicated vault, rotate them regularly, and never commit them to source control.',
          question: 'How are secrets (API keys, credentials) managed across build and deployment?',
          sampleAnswer:
            'All secrets are stored in a central vault, injected at runtime, rotated every 90 days, and never committed to source control — enforced by pre-commit scanning.',
        },
        {
          id: 'samm-dm-a',
          code: 'DM-A',
          name: 'Defect Management: Defect Tracking',
          description:
            'Systematically capture security defects found through any channel in a central tracking system.',
          guidance:
            'Route findings from testing, bug bounty, and production incidents into one triage queue with consistent severity ratings.',
          question: 'How are security defects from all sources captured in one place?',
          sampleAnswer:
            'Findings from SAST/DAST, penetration tests, bug bounty, and production incidents all flow into a single security queue with a consistent severity taxonomy.',
        },
        {
          id: 'samm-dm-b',
          code: 'DM-B',
          name: 'Defect Management: Defect Response',
          description:
            'Define and follow remediation timelines and root-cause analysis for tracked security defects.',
          guidance:
            'Set SLA targets by severity and analyze recurring defect classes to fix systemic causes.',
          question:
            'What are your remediation SLAs by severity, and how do you address root causes?',
          sampleAnswer:
            'Critical findings are fixed within 7 days, high within 30; quarterly trend analysis identifies recurring root causes (e.g., missing input validation) which feed back into training and linting rules.',
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
          question:
            'How do you confirm the as-built architecture matches the intended secure design?',
          sampleAnswer:
            'We run a documented architecture review against the reference design and threat model before each major release, with sign-off recorded in the release checklist.',
        },
        {
          id: 'samm-aa-b',
          code: 'AA-B',
          name: 'Architecture Assessment: Architecture Mitigation',
          description:
            'Identify and remediate architectural weaknesses discovered during assessment.',
          guidance:
            'Track architectural findings alongside code-level defects and prioritize by exploitability.',
          question:
            'How are architectural weaknesses found during review tracked and resolved?',
          sampleAnswer:
            'Architecture findings are logged as backlog items with the same severity/SLA framework as code defects, and re-verified at the next review cycle.',
        },
        {
          id: 'samm-rt-a',
          code: 'RT-A',
          name: 'Requirements-driven Testing: Control Verification',
          description:
            'Verify that specified security controls and requirements are correctly implemented through targeted testing.',
          guidance:
            'Maintain test cases traceable to each documented security requirement.',
          question:
            'How do you verify that each documented security requirement is actually implemented and tested?',
          sampleAnswer:
            'Each security requirement has a traceable test case in our test management tool, executed in the regression suite, with coverage reported before release sign-off.',
        },
        {
          id: 'samm-rt-b',
          code: 'RT-B',
          name: 'Requirements-driven Testing: Misuse/Abuse Testing',
          description:
            'Test how the application behaves under intentional misuse or abuse scenarios derived from threat models.',
          guidance:
            'Design abuse-case test scripts alongside functional test cases for high-risk features.',
          question: 'How do you test how the application behaves under intentional misuse?',
          sampleAnswer:
            'We derive abuse-case test scripts from the threat model (e.g., privilege escalation attempts, business-logic bypass) and run them alongside functional tests for high-risk features.',
        },
        {
          id: 'samm-st-a',
          code: 'ST-A',
          name: 'Security Testing: Scalable Baseline',
          description:
            'Apply automated, scalable security testing (e.g., SAST/DAST) broadly across the portfolio.',
          guidance:
            'Integrate baseline scanning into CI pipelines so every build is tested consistently.',
          question: 'What automated security testing runs on every build?',
          sampleAnswer:
            'Static analysis and dependency scanning run on every pull request via CI; dynamic testing runs nightly against the staging environment, with results surfaced directly in the PR.',
        },
        {
          id: 'samm-st-b',
          code: 'ST-B',
          name: 'Security Testing: Deep Understanding',
          description:
            'Perform deep, manual security testing (e.g., penetration testing) on high-risk applications.',
          guidance:
            'Commission expert-led testing for applications with the highest risk profile at least annually.',
          question:
            'How often do you commission manual penetration testing, and for which applications?',
          sampleAnswer:
            'High-risk, internet-facing applications receive an annual third-party penetration test plus testing after any major architecture change, with findings tracked to closure.',
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
          question: 'How do you detect a security incident in production?',
          sampleAnswer:
            'Centralized logging with correlation rules alerts the on-call security engineer within minutes of anomalous activity, such as repeated authentication failures or unexpected data egress.',
        },
        {
          id: 'samm-im-b',
          code: 'IM-B',
          name: 'Incident Management: Incident Response',
          description:
            'Respond to and recover from security incidents through a defined, rehearsed process.',
          guidance:
            'Maintain an incident response plan with clear roles, and run tabletop exercises periodically.',
          question: 'What is your incident response process once an incident is confirmed?',
          sampleAnswer:
            'We follow a documented incident response plan with defined roles (incident commander, communications lead), a 30-minute initial triage SLA, and run at least two tabletop exercises per year.',
        },
        {
          id: 'samm-em-a',
          code: 'EM-A',
          name: 'Environment Management: Configuration Hardening',
          description:
            'Harden the configuration of runtime environments to reduce the attack surface of deployed software.',
          guidance:
            'Apply baseline hardening standards (e.g., CIS benchmarks) to all production environments.',
          question:
            'How do you ensure production environments are hardened to a consistent baseline?',
          sampleAnswer:
            'All servers/containers are built from CIS-benchmarked golden images, with configuration drift detected automatically and remediated within 24 hours.',
        },
        {
          id: 'samm-em-b',
          code: 'EM-B',
          name: 'Environment Management: Patching & Vulnerability Management',
          description:
            'Identify and remediate vulnerabilities in the operational environment through timely patching.',
          guidance:
            'Run continuous vulnerability scanning and enforce patch SLAs based on severity.',
          question: 'How do you identify and remediate vulnerabilities in your infrastructure?',
          sampleAnswer:
            'Continuous vulnerability scanning runs weekly across all environments, with critical patches applied within 72 hours and a monthly patch cadence for everything else.',
        },
        {
          id: 'samm-om-a',
          code: 'OM-A',
          name: 'Operational Management: Data Protection',
          description:
            'Protect the confidentiality and integrity of sensitive data throughout its operational lifecycle.',
          guidance:
            'Classify data, encrypt it at rest and in transit, and enforce least-privilege access.',
          question: 'How is sensitive data protected in production?',
          sampleAnswer:
            'Data is classified at creation, encrypted at rest (AES-256) and in transit (TLS 1.2+), with access restricted via role-based controls and logged for audit.',
        },
        {
          id: 'samm-om-b',
          code: 'OM-B',
          name: 'Operational Management: Legacy Management',
          description:
            'Manage the risk of legacy and end-of-life software components still in operation.',
          guidance:
            'Maintain an inventory of legacy systems with compensating controls and a decommissioning plan.',
          question:
            'How do you manage the risk of legacy or end-of-life systems still in production?',
          sampleAnswer:
            'Legacy systems are inventoried with compensating controls (network segmentation, enhanced monitoring) and a funded decommissioning plan with a target retirement date.',
        },
      ],
    },
  ],
};
