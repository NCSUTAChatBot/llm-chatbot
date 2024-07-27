import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

/**
 * @file FAQ.js modified component file for the course evaluation FAQs
 * @author Sanjit Verma
 */
const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <Container
        id="faq"
        sx={{
          pt: { xs: 4, sm: 12 },
          pb: { xs: 8, sm: 16 },
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 2 },
        }}
      >
        <Typography
          component="h2"
          variant="h4"
          sx={{
            color: 'text.primary',
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          Frequently asked questions
        </Typography>
        <div className="accordion">
          {faqData.map((item, index) => (
            <div className="accordion-item" key={index}>
              <div
                className="accordion-header"
                onClick={() => toggleAccordion(index)}
              >
                <h3 className='h3'>{item.question}</h3>
                <div className={`icon ${activeIndex === index ? 'active' : ''}`}>
                  {activeIndex === index ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-7" style={{ width: '16px' }}>
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                  </svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" style={{ width: '16px' }}>
                      <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>

                  }
                </div>
              </div>
              <div
                className={`accordion-content ${activeIndex === index ? 'open' : ''
                  }`}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

    </div>
  );
};

const faqData = [
  {
    "question": "Are my chat messages being collected?",
    "answer": "Your chat messages are collected to improve our model and responses in accordance with our terms and conditions. We prioritize your privacy and take all necessary measures to protect your data."
  },
  {
    question: 'Who can I contact to provide feedback on the chatbot or troubleshoot issues?',
    answer:
      'You can submit feedback or report issues by clicking the Leave feedback button. Alternatively, you can contact our team for urgent matters at skverma@ncsu.edu (Sanjit Verma) or dhao5@ncsu.edu (Haoze Du). We\'re here to assist you promptly.',
  },
  {
    question: 'What should I do if the chatbot is not responding?',
    answer:
      'If the chatbot is not responding, try refreshing the page. If the issue persists, check your internet connection. For further assistance, contact our support team.',
  },
  {
    question: 'How accurate are the chatbot\'s responses?',
    answer:
      'The chatbot provides information based on the data it has been trained on. While it strives to give accurate and helpful answers, it\'s always best to cross-check critical information with reliable sources.',
  },
];

export default FAQ;
