import type { Framework } from '../../types';

/**
 * NIST Cybersecurity Framework (CSF) 2.0, modeled at category level (not full subcategory depth).
 */
export const nistCsfFramework: Framework = {
  id: 'nist-csf',
  name: 'NIST Cybersecurity Framework',
  shortName: 'NIST CSF',
  version: '2.0',
  description:
    'A voluntary framework of outcomes organized into six functions that helps organizations understand, assess, and manage cybersecurity risk.',
  reference: 'https://www.nist.gov/cyberframework',
  functions: [
    {
      id: 'csf-gv',
      code: 'GV',
      name: 'Govern',
      description:
        'The organization’s cybersecurity risk management strategy, expectations, and policy are established, communicated, and monitored.',
      controls: [
        {
          id: 'csf-gv-oc',
          code: 'GV.OC',
          name: 'Organizational Context',
          description:
            'The circumstances surrounding the organization’s mission, stakeholders, and legal/regulatory requirements are understood and inform cybersecurity risk management.',
          guidance:
            'Document mission objectives, stakeholder expectations, and applicable legal/regulatory obligations that shape risk decisions.',
          question:
            'How does your organization identify the mission, stakeholders, and legal/regulatory context that shape your cybersecurity priorities?',
          sampleAnswer:
            'We maintain a documented business context statement covering mission-critical services, key stakeholders, and applicable regulations (e.g., GDPR, SOX), reviewed annually by the risk committee.',
        },
        {
          id: 'csf-gv-rm',
          code: 'GV.RM',
          name: 'Risk Management Strategy',
          description:
            'The organization’s priorities, constraints, risk tolerance, and assumptions are established and used to support operational risk decisions.',
          guidance:
            'Define and communicate a risk appetite statement and use it to prioritize remediation and investment.',
          question: 'What is your organization’s risk appetite, and how is it used in decision-making?',
          sampleAnswer:
            'The board approved a formal risk appetite statement with quantified thresholds; any risk acceptance above threshold requires CISO or board sign-off, tracked in our GRC tool.',
        },
        {
          id: 'csf-gv-rr',
          code: 'GV.RR',
          name: 'Roles, Responsibilities, and Authorities',
          description:
            'Cybersecurity roles, responsibilities, and authorities are established, communicated, and coordinated internally and with external stakeholders.',
          guidance:
            'Maintain a RACI for cybersecurity decisions covering leadership, staff, and third parties.',
          question: 'How are cybersecurity roles and responsibilities defined and communicated?',
          sampleAnswer:
            'We maintain a RACI matrix covering all cybersecurity functions, published in our policy portal, with named owners for each control area reviewed at least annually.',
        },
        {
          id: 'csf-gv-po',
          code: 'GV.PO',
          name: 'Policy',
          description:
            'Organizational cybersecurity policy is established, communicated, and enforced.',
          guidance:
            'Review and update cybersecurity policy on a regular cycle and track acknowledgement across the workforce.',
          question: 'How is cybersecurity policy established, communicated, and enforced?',
          sampleAnswer:
            'Policies are approved by the CISO, published centrally, acknowledged annually by all staff via our HR system, with non-compliance escalated through a defined exception process.',
        },
        {
          id: 'csf-gv-ov',
          code: 'GV.OV',
          name: 'Oversight',
          description:
            'Results of organization-wide cybersecurity risk management activities are used to inform, improve, and adjust strategy.',
          guidance:
            'Report risk posture to senior leadership and the board on a defined cadence, with action items tracked to closure.',
          question: 'How does leadership review and act on cybersecurity risk information?',
          sampleAnswer:
            'The CISO presents a risk dashboard to the executive committee monthly and to the board quarterly, with action items tracked to closure in the following cycle.',
        },
        {
          id: 'csf-gv-sc',
          code: 'GV.SC',
          name: 'Cybersecurity Supply Chain Risk Management',
          description:
            'Cyber supply chain risk management processes are identified, established, managed, monitored, and improved by organizational stakeholders.',
          guidance:
            'Assess suppliers’ security posture before onboarding and monitor it through the life of the relationship.',
          question:
            'How do you assess and monitor the cybersecurity risk posed by suppliers?',
          sampleAnswer:
            'New suppliers complete a security questionnaire and risk tier assignment before onboarding; critical suppliers are reassessed annually and monitored via continuous third-party risk scoring.',
        },
      ],
    },
    {
      id: 'csf-id',
      code: 'ID',
      name: 'Identify',
      description:
        'The organization’s current cybersecurity risks are understood, including assets, and improvement opportunities.',
      controls: [
        {
          id: 'csf-id-am',
          code: 'ID.AM',
          name: 'Asset Management',
          description:
            'Assets (data, hardware, software, systems, facilities, services, and people) that enable the organization to achieve business purposes are identified and managed.',
          guidance:
            'Maintain a current inventory of assets with owners and business criticality assigned.',
          question:
            'How do you maintain an inventory of assets that support your business objectives?',
          sampleAnswer:
            'We maintain an automated CMDB covering hardware, software, and data assets, reconciled weekly against cloud and network discovery tools, with an owner and criticality rating assigned to each asset.',
        },
        {
          id: 'csf-id-ra',
          code: 'ID.RA',
          name: 'Risk Assessment',
          description:
            'The cybersecurity risk to the organization, assets, and individuals is understood by the organization.',
          guidance:
            'Perform periodic risk assessments covering threats, vulnerabilities, likelihood, and impact.',
          question: 'How often and how do you assess cybersecurity risk to the organization?',
          sampleAnswer:
            'We perform a formal risk assessment annually and after major changes, scoring likelihood and impact per NIST guidance, with results feeding the risk register and treatment plans.',
        },
        {
          id: 'csf-id-im',
          code: 'ID.IM',
          name: 'Improvement',
          description:
            'Improvements to organizational cybersecurity risk management processes, procedures, and activities are identified across all CSF functions.',
          guidance:
            'Capture lessons learned from incidents, audits, and exercises and feed them into a tracked improvement backlog.',
          question:
            'How do you capture and act on lessons learned to improve your security program?',
          sampleAnswer:
            'Post-incident reviews, audit findings, and exercise results feed a centralized improvement backlog, reviewed monthly by the security leadership team with assigned owners and due dates.',
        },
      ],
    },
    {
      id: 'csf-pr',
      code: 'PR',
      name: 'Protect',
      description:
        'Safeguards to manage the organization’s cybersecurity risks are used.',
      controls: [
        {
          id: 'csf-pr-aa',
          code: 'PR.AA',
          name: 'Identity Management, Authentication, and Access Control',
          description:
            'Access to physical and logical assets is limited to authorized users, services, and hardware, and managed commensurate with risk.',
          guidance:
            'Enforce least-privilege access, strong authentication, and periodic access recertification.',
          question:
            'How do you ensure only authorized users and services can access systems and data?',
          sampleAnswer:
            'We enforce least-privilege role-based access, multi-factor authentication for all remote and privileged access, and conduct quarterly access recertification with automatic de-provisioning on role change or termination.',
        },
        {
          id: 'csf-pr-at',
          code: 'PR.AT',
          name: 'Awareness and Training',
          description:
            'The organization’s personnel are provided cybersecurity awareness education and are trained to perform their cybersecurity-related duties.',
          guidance:
            'Deliver role-based security training with completion tracked and refreshed annually.',
          question: 'How do you ensure personnel understand their cybersecurity responsibilities?',
          sampleAnswer:
            'All staff complete annual security awareness training plus role-specific modules (e.g., secure coding for developers, phishing simulations for all staff), with completion tracked and enforced.',
        },
        {
          id: 'csf-pr-ds',
          code: 'PR.DS',
          name: 'Data Security',
          description:
            'Data are managed consistent with the organization’s risk strategy to protect confidentiality, integrity, and availability.',
          guidance:
            'Classify data and apply encryption, integrity checks, and retention controls proportionate to sensitivity.',
          question:
            'How do you protect the confidentiality, integrity, and availability of data?',
          sampleAnswer:
            'Data is classified, encrypted at rest and in transit, backed up with tested restoration procedures, and access is logged and reviewed quarterly.',
        },
        {
          id: 'csf-pr-ps',
          code: 'PR.PS',
          name: 'Platform Security',
          description:
            'The hardware, software, and services of physical and virtual platforms are managed consistent with the organization’s risk strategy.',
          guidance:
            'Harden operating systems and platforms to a baseline standard and manage configuration drift.',
          question:
            'How do you secure the underlying platforms and infrastructure that host your systems?',
          sampleAnswer:
            'All platforms are built from hardened, CIS-benchmarked baselines with automated configuration management and drift detection remediated within 24 hours.',
        },
        {
          id: 'csf-pr-ir',
          code: 'PR.IR',
          name: 'Technology Infrastructure Resilience',
          description:
            'Security architectures are managed with the organization’s risk strategy to protect asset confidentiality, integrity, availability, and organizational resilience.',
          guidance:
            'Design infrastructure with redundancy and segmentation to limit the blast radius of a compromise.',
          question:
            'How is your infrastructure architected to remain resilient and limit the impact of a compromise?',
          sampleAnswer:
            'We use network segmentation, redundant availability zones, and documented failover procedures tested twice a year via disaster recovery exercises.',
        },
      ],
    },
    {
      id: 'csf-de',
      code: 'DE',
      name: 'Detect',
      description:
        'Possible cybersecurity attacks and compromises are found and analyzed.',
      controls: [
        {
          id: 'csf-de-cm',
          code: 'DE.CM',
          name: 'Continuous Monitoring',
          description:
            'Assets are monitored to find anomalies, indicators of compromise, and other potentially adverse events.',
          guidance:
            'Deploy monitoring across network, endpoint, and application layers with centralized log aggregation.',
          question:
            'How do you continuously monitor your environment for signs of compromise?',
          sampleAnswer:
            'We run 24/7 SIEM monitoring across network, endpoint, and cloud logs with automated alerting and a dedicated SOC triaging alerts within 15 minutes.',
        },
        {
          id: 'csf-de-ae',
          code: 'DE.AE',
          name: 'Adverse Event Analysis',
          description:
            'Anomalies, indicators of compromise, and other potentially adverse events are analyzed to characterize the events and detect cybersecurity incidents.',
          guidance:
            'Correlate alerts across sources and triage them against defined severity criteria.',
          question:
            'How do you analyze and prioritize anomalies to determine if they represent a real incident?',
          sampleAnswer:
            'Alerts are correlated automatically and triaged by severity; analysts investigate using a documented playbook and escalate confirmed incidents to the incident response team within 30 minutes.',
        },
      ],
    },
    {
      id: 'csf-rs',
      code: 'RS',
      name: 'Respond',
      description:
        'Actions regarding a detected cybersecurity incident are taken.',
      controls: [
        {
          id: 'csf-rs-ma',
          code: 'RS.MA',
          name: 'Incident Management',
          description:
            'Responses to detected cybersecurity incidents are managed.',
          guidance:
            'Follow a documented incident management process with defined severity levels and escalation paths.',
          question: 'How do you manage the overall response once an incident is declared?',
          sampleAnswer:
            'We follow a documented incident management process with defined severity tiers, an incident commander role, and status updates to stakeholders every 30-60 minutes during active incidents.',
        },
        {
          id: 'csf-rs-an',
          code: 'RS.AN',
          name: 'Incident Analysis',
          description:
            'Investigations are conducted to ensure effective response and support forensics and recovery activities.',
          guidance:
            'Preserve evidence and perform root-cause analysis for every declared incident.',
          question:
            'How do you investigate incidents to understand scope and support recovery?',
          sampleAnswer:
            'We preserve forensic evidence per a documented chain-of-custody process and conduct root-cause analysis for every high-severity incident, documented in a formal post-incident report.',
        },
        {
          id: 'csf-rs-co',
          code: 'RS.CO',
          name: 'Incident Response Reporting and Communication',
          description:
            'Response activities are coordinated with internal and external stakeholders as required by laws, regulations, or policies.',
          guidance:
            'Maintain notification templates and contact lists for regulators, customers, and partners.',
          question:
            'How do you coordinate incident communication with internal and external stakeholders, including regulators?',
          sampleAnswer:
            'We maintain pre-approved notification templates and a stakeholder contact list, with legal and communications teams looped in within 2 hours of a confirmed incident meeting breach-notification criteria.',
        },
        {
          id: 'csf-rs-mi',
          code: 'RS.MI',
          name: 'Incident Mitigation',
          description:
            'Activities are performed to prevent expansion of an event and mitigate its effects.',
          guidance:
            'Contain affected systems quickly and apply compensating controls while remediation is underway.',
          question:
            'What actions do you take to contain and limit the impact of an active incident?',
          sampleAnswer:
            'Affected systems are isolated via automated network controls within minutes of confirmation, with compensating controls applied while permanent remediation is developed.',
        },
      ],
    },
    {
      id: 'csf-rc',
      code: 'RC',
      name: 'Recover',
      description:
        'Assets and operations affected by a cybersecurity incident are restored.',
      controls: [
        {
          id: 'csf-rc-rp',
          code: 'RC.RP',
          name: 'Incident Recovery Plan Execution',
          description:
            'Restoration activities are performed to ensure operational availability of systems and services affected by cybersecurity incidents.',
          guidance:
            'Maintain and test recovery runbooks and backups so restoration meets defined recovery time objectives.',
          question: 'How do you restore normal operations after an incident?',
          sampleAnswer:
            'We follow tested recovery runbooks with defined recovery time/point objectives per system criticality, validated via twice-yearly recovery exercises against actual backups.',
        },
        {
          id: 'csf-rc-co',
          code: 'RC.CO',
          name: 'Incident Recovery Communication',
          description:
            'Restoration activities are coordinated with internal and external parties.',
          guidance:
            'Keep stakeholders informed of recovery status and publish a post-incident summary once restored.',
          question:
            'How do you communicate recovery status to stakeholders and close out an incident?',
          sampleAnswer:
            'We provide stakeholders regular recovery status updates and issue a post-incident summary within 5 business days covering root cause, impact, and remediation actions taken.',
        },
      ],
    },
  ],
};
