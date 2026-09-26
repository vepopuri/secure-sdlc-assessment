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
        },
        {
          id: 'csf-gv-rm',
          code: 'GV.RM',
          name: 'Risk Management Strategy',
          description:
            'The organization’s priorities, constraints, risk tolerance, and assumptions are established and used to support operational risk decisions.',
          guidance:
            'Define and communicate a risk appetite statement and use it to prioritize remediation and investment.',
        },
        {
          id: 'csf-gv-rr',
          code: 'GV.RR',
          name: 'Roles, Responsibilities, and Authorities',
          description:
            'Cybersecurity roles, responsibilities, and authorities are established, communicated, and coordinated internally and with external stakeholders.',
          guidance:
            'Maintain a RACI for cybersecurity decisions covering leadership, staff, and third parties.',
        },
        {
          id: 'csf-gv-po',
          code: 'GV.PO',
          name: 'Policy',
          description:
            'Organizational cybersecurity policy is established, communicated, and enforced.',
          guidance:
            'Review and update cybersecurity policy on a regular cycle and track acknowledgement across the workforce.',
        },
        {
          id: 'csf-gv-ov',
          code: 'GV.OV',
          name: 'Oversight',
          description:
            'Results of organization-wide cybersecurity risk management activities are used to inform, improve, and adjust strategy.',
          guidance:
            'Report risk posture to senior leadership and the board on a defined cadence, with action items tracked to closure.',
        },
        {
          id: 'csf-gv-sc',
          code: 'GV.SC',
          name: 'Cybersecurity Supply Chain Risk Management',
          description:
            'Cyber supply chain risk management processes are identified, established, managed, monitored, and improved by organizational stakeholders.',
          guidance:
            'Assess suppliers’ security posture before onboarding and monitor it through the life of the relationship.',
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
        },
        {
          id: 'csf-id-ra',
          code: 'ID.RA',
          name: 'Risk Assessment',
          description:
            'The cybersecurity risk to the organization, assets, and individuals is understood by the organization.',
          guidance:
            'Perform periodic risk assessments covering threats, vulnerabilities, likelihood, and impact.',
        },
        {
          id: 'csf-id-im',
          code: 'ID.IM',
          name: 'Improvement',
          description:
            'Improvements to organizational cybersecurity risk management processes, procedures, and activities are identified across all CSF functions.',
          guidance:
            'Capture lessons learned from incidents, audits, and exercises and feed them into a tracked improvement backlog.',
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
        },
        {
          id: 'csf-pr-at',
          code: 'PR.AT',
          name: 'Awareness and Training',
          description:
            'The organization’s personnel are provided cybersecurity awareness education and are trained to perform their cybersecurity-related duties.',
          guidance:
            'Deliver role-based security training with completion tracked and refreshed annually.',
        },
        {
          id: 'csf-pr-ds',
          code: 'PR.DS',
          name: 'Data Security',
          description:
            'Data are managed consistent with the organization’s risk strategy to protect confidentiality, integrity, and availability.',
          guidance:
            'Classify data and apply encryption, integrity checks, and retention controls proportionate to sensitivity.',
        },
        {
          id: 'csf-pr-ps',
          code: 'PR.PS',
          name: 'Platform Security',
          description:
            'The hardware, software, and services of physical and virtual platforms are managed consistent with the organization’s risk strategy.',
          guidance:
            'Harden operating systems and platforms to a baseline standard and manage configuration drift.',
        },
        {
          id: 'csf-pr-ir',
          code: 'PR.IR',
          name: 'Technology Infrastructure Resilience',
          description:
            'Security architectures are managed with the organization’s risk strategy to protect asset confidentiality, integrity, availability, and organizational resilience.',
          guidance:
            'Design infrastructure with redundancy and segmentation to limit the blast radius of a compromise.',
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
        },
        {
          id: 'csf-de-ae',
          code: 'DE.AE',
          name: 'Adverse Event Analysis',
          description:
            'Anomalies, indicators of compromise, and other potentially adverse events are analyzed to characterize the events and detect cybersecurity incidents.',
          guidance:
            'Correlate alerts across sources and triage them against defined severity criteria.',
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
        },
        {
          id: 'csf-rs-an',
          code: 'RS.AN',
          name: 'Incident Analysis',
          description:
            'Investigations are conducted to ensure effective response and support forensics and recovery activities.',
          guidance:
            'Preserve evidence and perform root-cause analysis for every declared incident.',
        },
        {
          id: 'csf-rs-co',
          code: 'RS.CO',
          name: 'Incident Response Reporting and Communication',
          description:
            'Response activities are coordinated with internal and external stakeholders as required by laws, regulations, or policies.',
          guidance:
            'Maintain notification templates and contact lists for regulators, customers, and partners.',
        },
        {
          id: 'csf-rs-mi',
          code: 'RS.MI',
          name: 'Incident Mitigation',
          description:
            'Activities are performed to prevent expansion of an event and mitigate its effects.',
          guidance:
            'Contain affected systems quickly and apply compensating controls while remediation is underway.',
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
        },
        {
          id: 'csf-rc-co',
          code: 'RC.CO',
          name: 'Incident Recovery Communication',
          description:
            'Restoration activities are coordinated with internal and external parties.',
          guidance:
            'Keep stakeholders informed of recovery status and publish a post-incident summary once restored.',
        },
      ],
    },
  ],
};
