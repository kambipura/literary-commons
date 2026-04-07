/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MOCK DATA — Single source of truth for Phases 1–5
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// ── Users ───────────────────────────────────────────────

export const users = {
  'stu-001': {
    id: 'stu-001',
    name: 'Meera Krishnan',
    email: 'meera.k@sjcc.edu.in',
    role: 'student',
    rightNowIThink: 'stories are never just about the people in them',
  },
  'stu-002': {
    id: 'stu-002',
    name: 'Priya Nair',
    email: 'priya.n@sjcc.edu.in',
    role: 'student',
    rightNowIThink: 'every narrator is unreliable in their own way',
  },
  'stu-003': {
    id: 'stu-003',
    name: 'Samuel Thomas',
    email: 'samuel.t@sjcc.edu.in',
    role: 'student',
    rightNowIThink: 'postcolonial writing is about reclaiming a voice',
  },
  'stu-004': {
    id: 'stu-004',
    name: 'Aisha Fatima',
    email: 'aisha.f@sjcc.edu.in',
    role: 'student',
    rightNowIThink: 'the form of a poem IS its argument',
  },
  'stu-005': {
    id: 'stu-005',
    name: 'Rohan Desai',
    email: 'rohan.d@sjcc.edu.in',
    role: 'student',
    rightNowIThink: '',
  },
  'stu-006': {
    id: 'stu-006',
    name: 'Kavya Menon',
    email: 'kavya.m@sjcc.edu.in',
    role: 'student',
    rightNowIThink: 'translation always loses something but sometimes gains more',
  },
  'prof-001': {
    id: 'prof-001',
    name: 'Dr. Aditi Sharma',
    email: 'aditi.sharma@sjcc.edu.in',
    role: 'professor',
  },
  'admin-001': {
    id: 'admin-001',
    name: 'Saghar Ada',
    email: 'admin@sjcc.edu.in',
    role: 'admin',
  },
};

export const currentUserId = 'stu-001';

// ── Course ──────────────────────────────────────────────

export const allCourses = [
  {
    id: 'course-001',
    name: 'Introduction to Literature',
    code: '25A101',
    semester: 'Semester I 2026',
    university: 'St. Joseph\'s College of Commerce',
    professorId: 'prof-001',
    studentIds: ['stu-001', 'stu-002', 'stu-003', 'stu-004', 'stu-005', 'stu-006'],
    featuredChainId: 'chain-001',
    status: 'active',
  },
  {
    id: 'course-002',
    name: 'Modern Poetry',
    code: '25A102',
    semester: 'Semester I 2026',
    university: 'St. Joseph\'s College of Commerce',
    professorId: 'prof-001',
    studentIds: ['stu-001', 'stu-003', 'stu-005'],
    featuredChainId: null,
    status: 'active',
  },
  {
    id: 'course-003',
    name: 'The Postcolonial Novel',
    code: '24B201',
    semester: 'Semester II 2025',
    university: 'St. Joseph\'s College of Commerce',
    professorId: 'prof-001',
    studentIds: ['stu-002', 'stu-004', 'stu-006'],
    featuredChainId: null,
    status: 'archived',
  }
];

export const course = allCourses[0];

// ── Sessions ────────────────────────────────────────────

export const sessions = [
  {
    id: 'sess-001',
    courseId: 'course-001',
    number: 1,
    title: 'Why do we read fiction?',
    promptType: 'they-say',
    theySayPrompt: 'Many argue that fiction is entertainment — a way to escape the real world. But others suggest that stories are how we rehearse for life, how we practice empathy before we need it.',
    createdAt: '2026-01-15',
    isActive: false,
  },
  {
    id: 'sess-002',
    courseId: 'course-001',
    number: 2,
    title: 'The unreliable narrator',
    promptType: 'they-say',
    theySayPrompt: 'Critics have long argued that when a narrator cannot be trusted, the reader is forced into a more active role — we must read against the grain, catch the lies, fill the gaps ourselves.',
    createdAt: '2026-01-22',
    isActive: false,
  },
  {
    id: 'sess-003',
    courseId: 'course-001',
    number: 3,
    title: 'Rushdie and the politics of language',
    promptType: 'class-discussion',
    theySayPrompt: 'Salman Rushdie writes, "Those who do not have power over the story that dominates their lives, power to retell it, rethink it, deconstruct it… and change it as times change, truly are powerless." What does it mean to write in a coloniser\'s language?',
    createdAt: '2026-01-29',
    isActive: true,
  },
  {
    id: 'sess-004',
    courseId: 'course-001',
    number: 4,
    title: 'Poetry as argument',
    promptType: 'provocation',
    theySayPrompt: 'There is a common assumption that poetry is about feelings, not arguments. But the very form a poet chooses — the line break, the stanza, the refusal of punctuation — is itself a claim about how the world should be read.',
    createdAt: '2026-02-05',
    isActive: false,
  },
];

export const currentSession = sessions.find(s => s.isActive) || sessions[sessions.length - 1];

// ── Notebook (private notes) ────────────────────────────

export const notes = [
  {
    id: 'note-001',
    userId: 'stu-001',
    type: 'free',
    title: 'First impressions of Midnight\'s Children',
    content: 'The opening paragraph reads like a birth announcement written by someone who knows the child will grow up to be disappointed. Rushdie is performing confidence — the "I" is enormous — but there is something fragile underneath it. The sentence structure feels like it is trying to hold too much at once, and maybe that is the point.',
    tags: ['rushdie', 'midnight-children', 'narration'],
    sessionId: 'sess-003',
    isArchived: false,
    createdAt: '2026-01-30T10:15:00',
    updatedAt: '2026-01-30T10:45:00',
  },
  {
    id: 'note-002',
    userId: 'stu-001',
    type: 'positioned',
    title: 'On unreliable narrators and power',
    theySay: 'The conventional view is that unreliable narrators are a literary trick — a puzzle for the clever reader to solve.',
    iSay: 'But I think unreliability is not a trick. It is the most honest thing a narrator can do. Everyone tells their story from where they stand. Admitting that standing position — that bias — is more honest than pretending to be objective.',
    tags: ['narration', 'power', 'honesty'],
    sessionId: 'sess-002',
    isArchived: false,
    createdAt: '2026-01-23T14:30:00',
    updatedAt: '2026-01-24T09:00:00',
  },
  {
    id: 'note-003',
    userId: 'stu-001',
    type: 'reading',
    title: 'Achebe on language and colonialism',
    passage: '"The price a world language must be prepared to pay is submission to many different kinds of use." — Chinua Achebe, Morning Yet on Creation Day',
    response: 'Achebe is making a case for English as a tool that can be turned against its own history. He is not surrendering to the coloniser\'s language — he is colonising it back. But I wonder if this is too optimistic. Can you really decolonise the master\'s tool?',
    tags: ['achebe', 'language', 'postcolonial', 'decolonisation'],
    sessionId: 'sess-003',
    isArchived: false,
    createdAt: '2026-01-31T16:00:00',
    updatedAt: '2026-01-31T16:30:00',
  },
  {
    id: 'note-004',
    userId: 'stu-001',
    type: 'link',
    url: 'https://www.theguardian.com/books/2023/rushdie-language-freedom',
    linkTitle: 'Rushdie on Language and Freedom — The Guardian',
    whySaved: 'Rushdie talks about how choosing to write in English was not a capitulation but a strategic act. He compares it to jazz musicians taking European instruments and making something entirely new. This connects directly to what Achebe says about submission.',
    tags: ['rushdie', 'language', 'postcolonial'],
    sessionId: 'sess-003',
    isArchived: false,
    createdAt: '2026-02-01T11:00:00',
    updatedAt: '2026-02-01T11:00:00',
  },
  {
    id: 'note-005',
    userId: 'stu-001',
    type: 'free',
    title: 'Question I can\'t shake',
    content: 'If every narrator is unreliable, does that mean every reader is also unreliable? We bring our own biases to every text. So maybe "unreliable narration" is just narration, and "reliable narration" is the fiction.',
    tags: ['narration', 'reader', 'meta'],
    sessionId: 'sess-002',
    isArchived: false,
    createdAt: '2026-01-25T08:30:00',
    updatedAt: '2026-01-25T08:30:00',
  },
  {
    id: 'note-006',
    userId: 'stu-001',
    type: 'positioned',
    title: 'On fiction as rehearsal',
    theySay: 'Martha Nussbaum argues that reading novels cultivates empathy — that fiction is a kind of moral education.',
    iSay: 'I think Nussbaum is half right. Fiction does practice empathy, but it also practices cruelty, prejudice, and self-deception. The question is not whether fiction teaches us to feel, but whether we learn to notice what it is teaching us to feel.',
    tags: ['fiction', 'empathy', 'nussbaum'],
    sessionId: 'sess-001',
    isArchived: true,
    createdAt: '2026-01-16T13:00:00',
    updatedAt: '2026-01-17T10:00:00',
  },
  {
    id: 'note-007',
    userId: 'stu-001',
    type: 'reading',
    title: 'Walcott\'s "A Far Cry from Africa"',
    passage: '"I who am poisoned with the blood of both, / Where shall I turn, divided to the vein?"',
    response: 'Walcott is not asking a question he expects an answer to. The division IS the answer. Being "divided to the vein" is not a problem to be solved — it is a condition to be inhabited. This is what postcolonial writing does: it refuses to choose a side because both sides run through the same body.',
    tags: ['walcott', 'postcolonial', 'identity', 'poetry'],
    sessionId: 'sess-003',
    isArchived: false,
    createdAt: '2026-02-02T09:15:00',
    updatedAt: '2026-02-02T09:45:00',
  },
  {
    id: 'note-008',
    userId: 'stu-001',
    type: 'free',
    title: 'Poetry as argument idea',
    content: 'A line break is a claim. Where you break the line changes what the words mean. E.g. "I love / you" vs "I / love you" — the pause creates emphasis, and emphasis IS argument. Need to develop this for Session 4.',
    tags: ['poetry', 'form', 'argument'],
    sessionId: 'sess-004',
    isArchived: false,
    createdAt: '2026-02-04T20:00:00',
    updatedAt: '2026-02-04T20:00:00',
  },
  {
    id: 'note-quote-001',
    userId: 'stu-001',
    type: 'quote',
    title: 'Nussbaum - Quality of Attention',
    content: '"The novel constructs a paradigm of a style of ethical attention that is in many ways superior to that of abstract moral philosophy."',
    url: 'https://plato.stanford.edu/entries/nussbaum/',
    linkTitle: 'Martha Nussbaum - Stanford Encyclopedia',
    tags: ['empathy', 'nussbaum', 'philosophy'],
    sessionId: 'sess-001',
    isArchived: false,
    createdAt: '2026-02-05T10:00:00',
    updatedAt: '2026-02-05T10:00:00',
  },
];

// ── Reflections (class writing) ─────────────────────────

export const reflections = [
  {
    id: 'ref-001',
    userId: 'stu-001',
    sessionId: 'sess-003',
    title: 'Writing in the coloniser\'s language is not surrender',
    content: 'Rushdie\'s claim that those without power over their story are "truly powerless" assumes that power comes from telling. But Achebe complicates this: he argues that using the coloniser\'s language is itself a form of power, because it takes the tool and repurposes it.\n\nI want to push this further. Writing in English — for a postcolonial writer — is not surrender. It is infiltration. You enter the coloniser\'s house and rearrange the furniture. You use their grammar but break their syntax. Rushdie does this literally: his sentences run longer than English is comfortable with, stuffed with Hindi and Urdu, refusing to behave.\n\nBut there is a risk Achebe does not fully address. When you write in English, you gain a global audience, but you may lose the local one. The grandmother who speaks only Marathi cannot read your revolution. So the question becomes: who is this story for? And does the answer to that question change what the story means?',
    theySaySource: {
      type: 'prompt',
      sessionId: 'sess-003',
    },
    privacy: 'class',
    status: 'published',
    createdAt: '2026-01-30T15:00:00',
    updatedAt: '2026-01-30T16:30:00',
  },
  {
    id: 'ref-002',
    userId: 'stu-002',
    sessionId: 'sess-003',
    title: 'The grandmother\'s silence matters',
    content: 'Meera raises a point I hadn\'t considered: that writing in English means excluding the very people postcolonial literature claims to champion. The grandmother who speaks only Marathi cannot read Rushdie\'s defence of her world.\n\nThis changes my reading of Midnight\'s Children entirely. Saleem is narrating in English. His audience is not India — it is the world that colonised India. He is explaining himself to the people who made him, and there is something tragic about that.\n\nBut I also think there is a counter-argument. By writing in English, Rushdie forces the coloniser to confront their own history in their own language. The discomfort of reading about British India in English — that discomfort is the point. The language becomes a mirror, not a window.',
    theySaySource: {
      type: 'classmate',
      reflectionId: 'ref-001',
      userId: 'stu-001',
    },
    privacy: 'class',
    status: 'published',
    createdAt: '2026-01-31T09:00:00',
    updatedAt: '2026-01-31T10:15:00',
  },
  {
    id: 'ref-003',
    userId: 'stu-003',
    sessionId: 'sess-003',
    title: 'Language is never neutral',
    content: 'I want to complicate something both Meera and Priya assume: that English is the coloniser\'s language. Languages do not belong to nations. English itself was shaped by Latin, Norse, French — it is a colonised language. When Rushdie writes in English, he is not borrowing someone else\'s tool. He is adding another layer to a language that has always been shaped by conquest.\n\nWhat matters is not the language but the structures of power around it. A child in Bangalore who is told their Kannada is "not professional enough" — that child experiences English as colonial power. But Rushdie, who grew up bilingual, experiences English as home. Same language, different relationship.\n\nSo maybe the question is not "whose language is this?" but "what power does this language have over you?"',
    theySaySource: {
      type: 'classmate',
      reflectionId: 'ref-002',
      userId: 'stu-002',
    },
    privacy: 'class',
    status: 'published',
    createdAt: '2026-01-31T14:00:00',
    updatedAt: '2026-01-31T15:00:00',
  },
  {
    id: 'ref-004',
    userId: 'stu-004',
    sessionId: 'sess-002',
    title: 'Unreliability as honesty',
    content: 'We treat unreliable narrators as liars. But what if they are the most honest characters in fiction? Every person alive tells their story with gaps, exaggerations, and blind spots. A narrator who admits — or reveals — these distortions is doing something more truthful than one who pretends to see everything clearly.\n\nTake Humbert Humbert. He is monstrous, and his narration is full of lies. But Nabokov forces us to notice the lies. The beauty of the prose makes us complicit — we enjoy reading about horror, and that enjoyment is the point. The unreliable narrator does not just tell a story; they make us examine how we receive it.\n\nThis is what I mean when I say the form of a novel is its argument. The unreliable narration in Lolita is not a flaw — it is the thesis.',
    theySaySource: {
      type: 'prompt',
      sessionId: 'sess-002',
    },
    privacy: 'class',
    status: 'published',
    createdAt: '2026-01-23T11:00:00',
    updatedAt: '2026-01-23T12:30:00',
  },
  {
    id: 'ref-005',
    userId: 'stu-001',
    sessionId: 'sess-002',
    title: 'Every reader is also unreliable',
    content: 'Aisha\'s post on unreliability as honesty shifted something for me. If narrators are unreliable because all humans are unreliable, then readers must be unreliable too.\n\nI came to Lolita with a set of assumptions about what makes a narrator trustworthy. But those assumptions are shaped by my own position — my gender, my culture, my reading history. A different reader might catch different lies, miss different signals.\n\nSo "unreliable narration" is not just about the narrator. It is about the gap between narrator and reader. And that gap is different for every reader. Which means every reading of the same book is a different book.\n\nThis makes me think about our class in a new way. When we discuss a text, we are not converging on a single meaning. We are mapping the distances between our different unreliabilities.',
    theySaySource: {
      type: 'classmate',
      reflectionId: 'ref-004',
      userId: 'stu-004',
    },
    privacy: 'class',
    status: 'published',
    createdAt: '2026-01-24T16:00:00',
    updatedAt: '2026-01-24T17:00:00',
  },
  {
    id: 'ref-006',
    userId: 'stu-005',
    sessionId: 'sess-001',
    title: 'Fiction as escape is not shallow',
    content: 'The prompt frames escape and empathy as opposites. But I disagree.\n\nWhen I read a novel, I am escaping — from my life, my problems, my limited perspective. But that escape is exactly what makes empathy possible. I cannot practice empathy from inside my own head. I need to leave myself to encounter someone else.\n\nSo escape IS rehearsal. The fantasy reader who loses herself in another world is practicing the same skill as the literary reader who contemplates a Chekhov story. The skill is: leaving your own perspective. The destination is different, but the muscle is the same.\n\nWe should stop treating "escape" as a lesser form of reading.',
    theySaySource: {
      type: 'prompt',
      sessionId: 'sess-001',
    },
    privacy: 'class',
    status: 'published',
    createdAt: '2026-01-16T10:00:00',
    updatedAt: '2026-01-16T10:45:00',
  },
  {
    id: 'ref-007',
    userId: 'stu-001',
    sessionId: 'sess-001',
    title: 'Stories teach us what to feel, not just how',
    content: 'I started this course thinking fiction was about empathy. After our first discussion, I am less sure.\n\nFiction does not just teach us to feel. It teaches us what to feel and when. A novel decides who gets our sympathy and who gets our suspicion. It trains our emotional reflexes. And those reflexes are not always good.\n\nConsider how many novels teach us to sympathise with lone white men on journeys of self-discovery. Consider how few teach us to sympathise with the communities they pass through.\n\nSo fiction is not neutral moral education. It is persuasion dressed as experience. The question is not "does fiction make us more empathetic?" but "empathetic toward whom?"',
    theySaySource: {
      type: 'prompt',
      sessionId: 'sess-001',
    },
    privacy: 'class',
    status: 'published',
    createdAt: '2026-01-17T09:00:00',
    updatedAt: '2026-01-17T10:00:00',
  },
  {
    id: 'ref-008',
    userId: 'stu-001',
    sessionId: 'sess-003',
    title: 'Language as infiltration — a draft',
    content: 'Working out an idea about Rushdie\'s sentence structure as a form of resistance. His sentences refuse English grammar. They pile clause on clause, mixing languages mid-phrase, refusing the clean subject-verb-object that English prefers.\n\nThis is not bad writing. It is deliberate sabotage. He is inside the house of English, moving the walls.',
    theySaySource: {
      type: 'passage',
      text: '"Those who do not have power over the story that dominates their lives... truly are powerless." — Rushdie',
    },
    privacy: 'draft',
    status: 'draft',
    createdAt: '2026-02-03T14:00:00',
    updatedAt: '2026-02-03T14:30:00',
  },
];

// ── Reactions ───────────────────────────────────────────

export const reactions = [
  // ref-001 reactions
  { id: 'rx-001', reflectionId: 'ref-001', userId: 'stu-002', type: 'shifts' },
  { id: 'rx-002', reflectionId: 'ref-001', userId: 'stu-003', type: 'pushback' },
  { id: 'rx-003', reflectionId: 'ref-001', userId: 'stu-004', type: 'new' },
  // ref-002 reactions
  { id: 'rx-004', reflectionId: 'ref-002', userId: 'stu-001', type: 'shifts' },
  { id: 'rx-005', reflectionId: 'ref-002', userId: 'stu-004', type: 'new' },
  // ref-003 reactions
  { id: 'rx-006', reflectionId: 'ref-003', userId: 'stu-001', type: 'pushback' },
  { id: 'rx-007', reflectionId: 'ref-003', userId: 'stu-002', type: 'shifts' },
  // ref-004 reactions
  { id: 'rx-008', reflectionId: 'ref-004', userId: 'stu-001', type: 'shifts' },
  { id: 'rx-009', reflectionId: 'ref-004', userId: 'stu-003', type: 'new' },
  // ref-005 reactions
  { id: 'rx-010', reflectionId: 'ref-005', userId: 'stu-002', type: 'new' },
  { id: 'rx-011', reflectionId: 'ref-005', userId: 'stu-004', type: 'shifts' },
  // ref-007 reactions
  { id: 'rx-012', reflectionId: 'ref-007', userId: 'stu-003', type: 'pushback' },
  { id: 'rx-013', reflectionId: 'ref-007', userId: 'stu-006', type: 'shifts' },
];

// ── Comments ────────────────────────────────────────────

export const comments = [
  {
    id: 'cmt-001',
    reflectionId: 'ref-001',
    userId: 'stu-004',
    type: 'extending',
    content: 'The "rearranging furniture" metaphor is perfect. Rushdie does not just use English — he vandalises it lovingly. His sentences are acts of beautiful destruction.',
    createdAt: '2026-01-30T17:00:00',
  },
  {
    id: 'cmt-002',
    reflectionId: 'ref-001',
    userId: 'stu-003',
    type: 'complicating',
    content: 'But infiltration implies the house still belongs to someone else. What if the move is not to infiltrate but to rebuild? Not to use their grammar differently, but to create a grammar that was never theirs.',
    createdAt: '2026-01-30T18:00:00',
  },
  {
    id: 'cmt-003',
    reflectionId: 'ref-002',
    userId: 'stu-001',
    type: 'affirming',
    content: 'The idea that Saleem is explaining himself to the people who made him — this names something I felt but could not articulate. He is translating India for the audience that colonised it. The narration is an act of forced intimacy.',
    createdAt: '2026-01-31T11:00:00',
  },
  {
    id: 'cmt-004',
    reflectionId: 'ref-004',
    userId: 'stu-002',
    type: 'questioning',
    content: 'But is there a difference between an unreliable narrator who knows they are unreliable (like Humbert) and one who does not (like Stevens in Remains of the Day)? Does the self-awareness change the ethics?',
    createdAt: '2026-01-23T14:00:00',
  },
  {
    id: 'cmt-005',
    reflectionId: 'ref-005',
    userId: 'stu-003',
    type: 'extending',
    content: 'This is why I love the idea of "mapping distances between unreliabilities." A classroom discussion is not consensus-building. It is a cartography of blind spots.',
    createdAt: '2026-01-25T09:00:00',
  },
  {
    id: 'cmt-006',
    reflectionId: 'ref-007',
    userId: 'stu-006',
    type: 'questioning',
    content: 'You say fiction trains our emotional reflexes. But can\'t we choose to resist that training? To read against the grain? Isn\'t that what critical reading is?',
    createdAt: '2026-01-18T10:00:00',
  },
];

// ── Response chains ─────────────────────────────────────

export const responseChains = [
  {
    id: 'chain-001',
    sessionId: 'sess-003',
    title: 'Language, power, and the grandmother\'s silence',
    reflectionIds: ['ref-001', 'ref-002', 'ref-003'],
  },
  {
    id: 'chain-002',
    sessionId: 'sess-002',
    title: 'Unreliable narrators and unreliable readers',
    reflectionIds: ['ref-004', 'ref-005'],
  },
];

// ── Tags ────────────────────────────────────────────────

export const allTags = [
  'rushdie', 'midnight-children', 'narration', 'power', 'honesty',
  'achebe', 'language', 'postcolonial', 'decolonisation', 'fiction',
  'empathy', 'nussbaum', 'walcott', 'identity', 'poetry', 'form',
  'argument', 'reader', 'meta', 'translation',
];

// ── Essays ──────────────────────────────────────────────

export const essays = [
  {
    id: 'essay-001',
    userId: 'stu-001',
    title: 'The Language of Revolution: English as Infiltration in Postcolonial Literature',
    sections: [
      {
        id: 'esec-001',
        type: 'they-say',
        sourceType: 'reflection',
        sourceId: 'ref-001',
        content: '',
        label: 'Session 3 — my initial reflection on Rushdie and language',
      },
      {
        id: 'esec-002',
        type: 'they-say',
        sourceType: 'note',
        sourceId: 'note-003',
        content: '',
        label: 'Achebe reading note — "submission to many different kinds of use"',
      },
      {
        id: 'esec-003',
        type: 'i-say',
        sourceType: 'prose',
        sourceId: null,
        content: 'The relationship between language and power in postcolonial literature is not a simple binary of resistance and surrender. Both Rushdie and Achebe propose something more nuanced: that using the coloniser\'s language can be an act of transformation rather than capitulation.',
        label: 'Connecting argument',
      },
      {
        id: 'esec-004',
        type: 'they-say',
        sourceType: 'classmate',
        sourceId: 'ref-002',
        content: '',
        label: 'Priya\'s response — the grandmother\'s silence',
      },
      {
        id: 'esec-005',
        type: 'so-what',
        sourceType: 'prose',
        sourceId: null,
        content: '',
        label: 'Conclusion — who is the revolution for?',
      },
    ],
    status: 'draft',
    createdAt: '2026-02-03T16:00:00',
    updatedAt: '2026-02-03T16:00:00',
  },
];

// ── Saved links ─────────────────────────────────────────

export const savedLinks = [
  {
    id: 'link-001',
    userId: 'stu-001',
    url: 'https://www.theguardian.com/books/2023/rushdie-language-freedom',
    title: 'Rushdie on Language and Freedom — The Guardian',
    whySaved: 'Rushdie compares writing in English to jazz musicians taking European instruments and making something new. Connects to Achebe.',
    tags: ['rushdie', 'language', 'postcolonial'],
    sessionId: 'sess-003',
    createdAt: '2026-02-01T11:00:00',
  },
  {
    id: 'link-002',
    userId: 'stu-001',
    url: 'https://aeon.co/essays/the-politics-of-the-mother-tongue',
    title: 'The Politics of the Mother Tongue — Aeon',
    whySaved: 'Long essay on how "mother tongue" is itself a political concept. Useful for thinking about whose language English really is.',
    tags: ['language', 'postcolonial', 'identity'],
    sessionId: 'sess-003',
    createdAt: '2026-02-02T14:00:00',
  },
];

// ── Peer recommendations ────────────────────────────────

export const peerRecommendations = [
  {
    id: 'rec-001',
    fromUserId: 'stu-004',
    toUserId: 'stu-001',
    linkId: null,
    url: 'https://www.poetryfoundation.org/poems/walcott-far-cry',
    title: 'A Far Cry from Africa — Poetry Foundation',
    note: 'I thought of you when I re-read this because of your point about language as infiltration. Walcott is doing the same thing with poetic form — using the coloniser\'s iambic pentameter but breaking it.',
    createdAt: '2026-02-02T12:00:00',
    isRead: true,
  },
  {
    id: 'rec-002',
    fromUserId: 'stu-003',
    toUserId: 'stu-001',
    linkId: null,
    url: 'https://www.lrb.co.uk/the-paper/ngũgĩ-decolonising-language',
    title: 'Ngũgĩ wa Thiong\'o on Decolonising the Mind',
    note: 'This is the counter-argument to your Rushdie position. Ngũgĩ argues that writing in African languages IS the revolution. It is a direct rebuttal to Achebe.',
    createdAt: '2026-02-03T08:00:00',
    isRead: false,
  },
];

// ── Annotations (professor feedback) ────────────────────

export const annotations = [
  {
    id: 'ann-001',
    reflectionId: 'ref-001',
    professorId: 'prof-001',
    paragraphIndex: 0,
    moveType: 'they-say',
    selectedText: 'Rushdie\'s claim that those without power over their story are "truly powerless"',
    comment: 'Good They Say move — you\'re entering the conversation through Rushdie\'s claim. Clear and direct.',
    createdAt: '2026-01-31T10:00:00',
  },
  {
    id: 'ann-002',
    reflectionId: 'ref-001',
    professorId: 'prof-001',
    paragraphIndex: 1,
    moveType: 'i-say',
    selectedText: 'Writing in English — for a postcolonial writer — is not surrender. It is infiltration.',
    comment: 'Strong I Say. "Infiltration" is a vivid metaphor. Push this further — what does infiltration look like at the sentence level?',
    createdAt: '2026-01-31T10:05:00',
  },
  {
    id: 'ann-003',
    reflectionId: 'ref-001',
    professorId: 'prof-001',
    paragraphIndex: 2,
    moveType: 'so-what',
    selectedText: 'who is this story for? And does the answer to that question change what the story means?',
    comment: 'Excellent So What — this question opens the argument rather than closing it. Consider: if the audience shapes meaning, what happens when the audience changes over time?',
    createdAt: '2026-01-31T10:10:00',
  },
  {
    id: 'ann-004',
    reflectionId: 'ref-002',
    professorId: 'prof-001',
    paragraphIndex: 0,
    moveType: 'they-say',
    comment: 'You\'re entering through Meera\'s argument — good practice in building on classmates. The framing is sharp.',
    createdAt: '2026-02-01T09:00:00',
  },
  {
    id: 'ann-005',
    reflectionId: 'ref-002',
    professorId: 'prof-001',
    paragraphIndex: 2,
    moveType: null,
    comment: 'The mirror/window distinction is powerful. Consider: does Rushdie intend the discomfort, or is it an accidental effect of writing for a global market?',
    createdAt: '2026-02-01T09:05:00',
  },
  {
    id: 'ann-006',
    reflectionId: 'ref-004',
    professorId: 'prof-001',
    paragraphIndex: 1,
    moveType: 'i-say',
    comment: 'The Lolita example is perfect here. You\'re making the reader do work — forcing them to confront their own pleasure. This is exactly the kind of I Say move that earns its complexity.',
    createdAt: '2026-01-24T08:30:00',
  },
];

// ── Free Notes (student → professor) ────────────────────

export const freeNotes = [
  {
    id: 'fnote-001',
    userId: 'stu-001',
    title: 'Thinking about the grandmother',
    content: 'I keep coming back to the question I raised in my reflection — who is the revolution for? My own grandmother speaks only Marathi and Konkani. She will never read Rushdie. Does that make his project irrelevant to her, or does it make it more urgent? I don\'t have an answer yet but I wanted to share this thought.',
    createdAt: '2026-02-02T18:00:00',
    isRead: true,
  },
  {
    id: 'fnote-002',
    userId: 'stu-004',
    title: 'A question about the essay',
    content: 'I\'m not sure how to structure my essay around the unreliability argument. Should I start with the conventional view and then complicate it, or should I start with my own position and use the conventional view as a foil? I think both could work but they lead to very different essays.',
    createdAt: '2026-02-03T11:00:00',
    isRead: false,
  },
  {
    id: 'fnote-003',
    userId: 'stu-006',
    title: 'Connection I found',
    content: 'In my translation studies elective, we\'re reading Walter Benjamin\'s "The Task of the Translator" — and he argues that translation doesn\'t serve the original, it gives the original an "afterlife." This feels directly connected to what we\'re discussing about writing in English. Rushdie\'s English is not a translation of Hindi/Urdu — it\'s giving English an afterlife it didn\'t ask for.',
    createdAt: '2026-02-04T14:00:00',
    isRead: false,
  },
];

// ── Grades ──────────────────────────────────────────────

export const grades = [
  {
    id: 'grade-001',
    reflectionId: 'ref-001',
    studentId: 'stu-001',
    professorId: 'prof-001',
    grade: 'A-',
    overallFeedback: 'A strong entry into the postcolonial conversation. Your infiltration metaphor is vivid and productive. Push further on specific textual evidence.',
    feedback: {
      theySay: 'Clear entry through Rushdie and Achebe. You set up the conversation well.',
      iSay: 'Your "infiltration" metaphor is strong. Consider supporting it with specific textual evidence — which sentences in Rushdie enact this infiltration?',
      soWhat: 'The question about audience is exactly the right So What move. Push this in your essay.',
    },
    createdAt: '2026-01-31T10:15:00',
  },
  {
    id: 'grade-002',
    reflectionId: 'ref-004',
    studentId: 'stu-004',
    professorId: 'prof-001',
    grade: 'A',
    overallFeedback: 'Exceptional work. You\'ve turned the concept of unreliability into a thesis about form itself. The Lolita example is deployed perfectly.',
    feedback: {
      theySay: 'You enter through the conventional view and immediately complicate it — strong move.',
      iSay: 'The argument that form IS argument is exactly right. This could anchor your semester essay.',
      soWhat: 'You push the reader to examine their own complicity. This is the hardest So What move and you handle it well.',
    },
    createdAt: '2026-01-24T09:00:00',
  },
  {
    id: 'grade-003',
    reflectionId: 'ref-006',
    studentId: 'stu-005',
    professorId: 'prof-001',
    grade: 'B+',
    overallFeedback: 'Good pushback on the escape/empathy binary. Your argument about the "same muscle" is intuitive but needs more support. What specific reading experiences demonstrate this?',
    feedback: {
      theySay: 'Clear entry through the prompt\'s binary.',
      iSay: 'The "same muscle" argument is promising but could be more specific.',
      soWhat: 'The call to stop treating escape as lesser is a good So What, but could go further — what changes if we take this seriously?',
    },
    createdAt: '2026-01-17T14:00:00',
  },
  {
    id: 'grade-004',
    reflectionId: 'ref-007',
    studentId: 'stu-001',
    professorId: 'prof-001',
    grade: 'A',
    overallFeedback: 'Brilliant pivot from the expected empathy argument to the question of directed empathy. "Persuasion dressed as experience" is a line worth developing into an essay.',
    feedback: {
      theySay: 'Nussbaum is the right entry point and you handle it with nuance.',
      iSay: 'The observation about whose stories get sympathy is politically sharp without being reductive.',
      soWhat: 'Reframing the question from "does fiction build empathy" to "empathy toward whom" is transformative.',
    },
    createdAt: '2026-01-18T11:00:00',
  },
];

// ── Helper functions ────────────────────────────────────

export function getUser(id) {
  return users[id];
}

export function getUserName(id) {
  return users[id]?.name || 'Unknown';
}

export function getAllCourses() {
  return allCourses;
}

export function getReflectionReactions(reflectionId) {
  return reactions.filter(r => r.reflectionId === reflectionId);
}

export function getReflectionComments(reflectionId) {
  return comments.filter(c => c.reflectionId === reflectionId);
}

export function getSessionReflections(sessionId) {
  return reflections.filter(r => r.sessionId === sessionId && r.status === 'published');
}

export function getUserNotes(userId) {
  return notes.filter(n => n.userId === userId);
}

export function getUserReflections(userId) {
  return reflections.filter(r => r.userId === userId);
}

export function getReflectionChain(reflectionId) {
  const chain = responseChains.find(c => c.reflectionIds.includes(reflectionId));
  if (!chain) return null;
  return {
    ...chain,
    reflections: chain.reflectionIds.map(id =>
      reflections.find(r => r.id === id)
    ).filter(Boolean),
  };
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function formatRelative(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}

export function getTheySayLabel(source) {
  if (!source) return '';
  if (source.type === 'prompt') {
    const session = sessions.find(s => s.id === source.sessionId);
    return `Responding to session prompt: "${session?.title}"`;
  }
  if (source.type === 'classmate') {
    const ref = reflections.find(r => r.id === source.reflectionId);
    const user = users[source.userId];
    return `Responding to ${user?.name}: "${ref?.title}"`;
  }
  if (source.type === 'passage') {
    return `Responding to: ${source.text?.slice(0, 80)}…`;
  }
  if (source.type === 'free') {
    return source.text || '';
  }
  return '';
}

// ── Professor helper functions ──────────────────────────

export function getStudentGrades(studentId) {
  return grades.filter(g => g.studentId === studentId);
}

export function getStudentAnnotations(studentId) {
  const studentRefIds = reflections
    .filter(r => r.userId === studentId)
    .map(r => r.id);
  return annotations.filter(a => studentRefIds.includes(a.reflectionId));
}

export function getCourseParticipation() {
  return course.studentIds.map(sid => {
    const user = users[sid];
    const studentRefs = reflections.filter(r => r.userId === sid && r.status === 'published');
    const studentComments = comments.filter(c => c.userId === sid);
    const studentReactions = reactions.filter(r => r.userId === sid);
    const allDates = [
      ...studentRefs.map(r => r.createdAt),
      ...studentComments.map(c => c.createdAt),
    ].filter(Boolean);
    const lastActive = allDates.sort().reverse()[0] || null;

    return {
      studentId: sid,
      name: user?.name || 'Unknown',
      email: user?.email || '',
      reflectionsCount: studentRefs.length,
      commentsCount: studentComments.length,
      reactionsCount: studentReactions.length,
      lastActive,
      avgGrade: getStudentAvgGrade(sid),
    };
  });
}

export function getSessionStats(sessionId) {
  const sessionRefs = reflections.filter(
    r => r.sessionId === sessionId && r.status === 'published'
  );
  const wordCounts = sessionRefs.map(r => r.content.split(/\s+/).length);
  const avgWordCount = wordCounts.length > 0
    ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
    : 0;

  return {
    sessionId,
    responseCount: sessionRefs.length,
    uniqueStudents: new Set(sessionRefs.map(r => r.userId)).size,
    avgWordCount,
  };
}

export function getReflectionAnnotations(reflectionId) {
  return annotations.filter(a => a.reflectionId === reflectionId);
}

export function getReflectionGrade(reflectionId) {
  return grades.find(g => g.reflectionId === reflectionId) || null;
}

export function getAllStudentSubmissions() {
  const published = reflections.filter(r => r.status === 'published');
  return [...published].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getStudentAvgGrade(studentId) {
  const studentGrades = grades.filter(g => g.studentId === studentId);
  if (studentGrades.length === 0) return null;
  const gradeValues = {
    'A+': 4.3, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D': 1.0, 'F': 0,
  };
  const sum = studentGrades.reduce((acc, g) => acc + (gradeValues[g.grade] || 0), 0);
  const avg = sum / studentGrades.length;
  const entries = Object.entries(gradeValues).sort((a, b) => b[1] - a[1]);
  for (const [letter, val] of entries) {
    if (avg >= val - 0.15) return letter;
  }
  return 'F';
}

export function getFreeNotes() {
  return freeNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export const PROMPT_TYPES = {
  'they-say': { label: 'They Say', helper: 'Frame this as a position students will respond to — what does the critical conversation say?' },
  'class-discussion': { label: 'Class Discussion', helper: 'Summarize what emerged in class that students should reflect on.' },
  'provocation': { label: 'Professor\'s Provocation', helper: 'State your own position or challenge that students can engage with.' },
  'open': { label: 'Open', helper: 'An open prompt — students can respond in any direction.' },
};
