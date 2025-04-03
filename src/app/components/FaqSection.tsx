'use client';

import styles from '../styles/FaqSection.module.css';
import { useState } from 'react';

const faqs = [
  {
    question: 'What is a website triage?',
    answer:
      'It’s a quick, expert diagnosis of your website issue — whether it’s broken, slow, or unresponsive. We assess the damage, stabilize the problem, and recommend next steps.',
  },
  {
    question: 'Do I have to commit to anything after the triage?',
    answer:
      'Nope. You’ll receive a clear diagnosis and treatment options — no pressure, no surprise charges.',
  },
  {
    question: 'What kinds of issues can you fix?',
    answer:
      'We handle layout bugs, broken functionality, plugin conflicts, speed issues, mobile problems, and more. If it’s web-related, we can fix it or guide you to the right solution.',
  },
  {
    question: 'How fast will you respond?',
    answer:
      'We typically respond within a few hours — and critical issues are prioritized immediately. You’ll always know where things stand.',
  },
  {
    question: 'Can you rebuild my site if it’s outdated?',
    answer:
      'Absolutely. Our Full Recovery Plan is designed to refresh, rebuild, and optimize websites that need a full transformation.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faq}>
      <h2 className={styles.title}>Frequently Asked Questions</h2>
      <div className={styles.list}>
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`${styles.item} ${openIndex === index ? styles.open : ''}`}
            onClick={() => toggle(index)}
          >
            <h3 className={styles.question}>{faq.question}</h3>
            {openIndex === index && <p className={styles.answer}>{faq.answer}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
