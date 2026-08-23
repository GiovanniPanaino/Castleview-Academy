const nav = document.getElementById('siteNav');
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
const year = document.getElementById('year');

year.textContent = new Date().getFullYear();

const setNav = () => nav.classList.toggle('scrolled', window.scrollY > 30);
setNav();
window.addEventListener('scroll', setNav, { passive: true });

menuBtn.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

/*
  RECURRING FLY-IN ANIMATIONS
  We deliberately DO NOT unobserve elements.
  When an element leaves the viewport, .in is removed.
  When it enters again — from either direction — it flies in again.
*/
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    } else {
      entry.target.classList.remove('in');
    }
  });
}, {
  threshold: 0.16,
  rootMargin: '-4% 0px -4% 0px'
});

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* LEARNING PATHWAY MODAL */
const pathwayData = {
  facilitation: {
    eyebrow: '01 / Homeschooling facilitation',
    title: 'A structured school day around an online curriculum.',
    lead: 'For families who choose homeschooling but still want routine, academic accountability and a real learning community around their child.',
    image: 'gallery/albums/IntermediateClass2.jpeg',
    imageAlt: 'Castleview learners receiving classroom support',
    details: [
      ['What we do', 'Facilitate the learner’s registered curriculum, explain difficult work, help manage daily tasks and keep learning moving forward.'],
      ['Who it suits', 'Learners from Grade R–12 who are registered with an approved curriculum provider and benefit from in-person guidance and structure.'],
      ['The important distinction', 'Castleview is the facilitator and support centre; the learner remains registered with their chosen curriculum provider.'],
      ['The goal', 'Build independence without leaving the learner isolated or the parent carrying the full academic load.']
    ]
  },
  primary: {
    eyebrow: '02 / Primary foundations',
    title: 'Build the foundations before the cracks become gaps.',
    lead: 'Younger learners need repetition, encouragement and patient explanation. We focus on strong basics while helping them develop confidence and healthy learning routines.',
    image: 'gallery/albums/InClass/arts_crafts.webp',
    imageAlt: 'Castleview learners taking part in a creative classroom activity',
    details: [
      ['Core focus', 'Literacy, reading comprehension, writing, numeracy, projects and age-appropriate study habits.'],
      ['How support works', 'Small-group guidance gives learners room to ask questions and receive explanations at a manageable pace.'],
      ['Beyond homework', 'We reinforce concepts that were missed or misunderstood instead of simply trying to finish the page.'],
      ['The goal', 'A learner who understands the basics, trusts their own ability and approaches new work with less anxiety.']
    ]
  },
  senior: {
    eyebrow: '03 / Senior phase',
    title: 'The stage where subjects get harder — and habits matter more.',
    lead: 'Grades 8 and 9 bring more specialised subjects and growing academic pressure. This pathway provides targeted support before learners enter the FET phase.',
    image: 'gallery/albums/InClass/group-study.webp',
    imageAlt: 'Castleview learners studying together',
    details: [
      ['Academic focus', 'Subject-specific tutoring, assignments, projects, assessment preparation and closing conceptual gaps.'],
      ['Study skills', 'Learners are guided toward better planning, note-taking, revision and independent problem-solving.'],
      ['Small-group advantage', 'Questions can be dealt with immediately instead of being carried silently from one lesson to the next.'],
      ['The goal', 'Prepare learners academically and practically for the increased demands of Grades 10–12.']
    ]
  },
  fet: {
    eyebrow: '04 / FET & matric',
    title: 'Serious support when the stakes become real.',
    lead: 'Grades 10–12 require stronger subject mastery, exam technique and disciplined preparation. We help learners turn a large workload into an achievable plan.',
    image: 'gallery/albums/GroupPhotos/group-photo-2024.webp',
    imageAlt: 'Castleview senior learners together',
    details: [
      ['Academic support', 'Subject guidance, difficult concepts, assessment preparation, revision planning and focused intervention where marks are being lost.'],
      ['Exam preparation', 'Past-paper practice, question interpretation, time management and identifying recurring weaknesses.'],
      ['FET environment', 'Castleview provides SACAI FET invigilation support alongside academic preparation.'],
      ['The goal', 'Help learners approach assessments with preparation, strategy and confidence rather than panic.']
    ]
  },
  homework: {
    eyebrow: '05 / Homework support',
    title: 'A productive afternoon instead of an evening battle.',
    lead: 'Homework support gives learners a structured environment where they can complete schoolwork, ask for help and deal with misunderstandings before going home.',
    image: 'gallery/albums/Staircase.jpeg',
    imageAlt: 'Castleview learning centre interior',
    details: [
      ['Daily structure', 'A calm place to work through homework, projects and upcoming assessments with guidance nearby.'],
      ['When they get stuck', 'Tutors can explain the concept rather than allowing a learner to guess their way through the task.'],
      ['For parents', 'It can reduce the pressure of becoming the teacher after an already long working day.'],
      ['The goal', 'Better completion, fewer accumulated gaps and more productive use of after-school time.']
    ]
  },
  rewrite: {
    eyebrow: '06 / Matric subject rewrite',
    title: 'A second attempt deserves a better strategy.',
    lead: 'For learners returning to improve individual matric subjects, the focus is no longer simply “do it again”. We identify what failed the first time and prepare differently.',
    image: 'gallery/albums/OurBranding/entrance.webp',
    imageAlt: 'Castleview Private Academy entrance',
    details: [
      ['Targeted preparation', 'Revision is centred on the chosen subject, weak topics and the type of questions that consistently cost marks.'],
      ['Past papers', 'Practice under exam-style conditions helps develop familiarity, timing and confidence.'],
      ['Rebuilding momentum', 'A rewrite can feel discouraging; clear milestones make improvement visible and manageable.'],
      ['The goal', 'Turn the rewrite into a deliberate improvement plan rather than a repeat of the previous year.']
    ]
  }
};

const pathwayModal = document.getElementById('pathwayModal');
const modalEyebrow = document.getElementById('pathwayModalEyebrow');
const modalTitle = document.getElementById('pathwayModalTitle');
const modalLead = document.getElementById('pathwayModalLead');
const modalDetails = document.getElementById('pathwayModalDetails');
const modalImage = document.getElementById('pathwayModalImage');
const modalClose = document.getElementById('pathwayModalClose');
const modalDone = document.getElementById('pathwayModalDone');
const pathwayEnquire = document.getElementById('pathwayEnquire');

function openPathway(key) {
  const data = pathwayData[key];
  if (!data) return;

  modalEyebrow.textContent = data.eyebrow;
  modalTitle.textContent = data.title;
  modalLead.textContent = data.lead;
  modalImage.src = data.image;
  modalImage.alt = data.imageAlt;
  modalDetails.innerHTML = data.details.map(([heading, copy]) => `
    <div class="modal-detail">
      <strong>${heading}</strong>
      <span>${copy}</span>
    </div>
  `).join('');

  pathwayModal.dataset.activePathway = key;
  pathwayModal.showModal();
  document.body.classList.add('modal-open');
}

function closePathway() {
  if (pathwayModal.open) pathwayModal.close();
}

document.querySelectorAll('[data-pathway]').forEach(card => {
  card.addEventListener('click', () => openPathway(card.dataset.pathway));
});

modalClose.addEventListener('click', closePathway);
modalDone.addEventListener('click', closePathway);
pathwayModal.addEventListener('close', () => document.body.classList.remove('modal-open'));
pathwayModal.addEventListener('click', event => {
  if (event.target === pathwayModal) closePathway();
});

pathwayEnquire.addEventListener('click', () => {
  const key = pathwayModal.dataset.activePathway;
  const serviceMap = {
    facilitation: 'Homeschooling facilitation',
    primary: 'Homework support',
    senior: 'Subject tutoring',
    fet: 'FET / matric support',
    homework: 'Homework support',
    rewrite: 'Matric subject rewrite'
  };
  const service = document.getElementById('service');
  if (serviceMap[key]) service.value = serviceMap[key];
  closePathway();
});

/* ENQUIRY */
const enquiry = () => {
  const parent = document.getElementById('parentName').value.trim();
  const learner = document.getElementById('learnerName').value.trim();
  const grade = document.getElementById('grade').value;
  const service = document.getElementById('service').value;
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();
  return { parent, learner, grade, service, phone, email, message };
};

document.getElementById('enquiryForm').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;

  const d = enquiry();
  const subject = encodeURIComponent(`Castleview enquiry - ${d.learner} - ${d.grade}`);
  const body = encodeURIComponent(`Parent/Guardian: ${d.parent}\nLearner: ${d.learner}\nGrade: ${d.grade}\nService: ${d.service}\nPhone: ${d.phone}\nEmail: ${d.email}\n\nMessage:\n${d.message}`);
  location.href = `mailto:castleviewprivateacademy@gmail.com?subject=${subject}&body=${body}`;
});

document.getElementById('waButton').addEventListener('click', () => {
  const form = document.getElementById('enquiryForm');
  if (!form.reportValidity()) return;

  const d = enquiry();
  const text = encodeURIComponent(`Hello Castleview Private Academy. I would like to enquire.\n\nParent/Guardian: ${d.parent}\nLearner: ${d.learner}\nGrade: ${d.grade}\nService: ${d.service}\nPhone: ${d.phone}\nEmail: ${d.email}\n\n${d.message}`);
  window.open(`https://wa.me/27774961343?text=${text}`, '_blank', 'noopener');
});
