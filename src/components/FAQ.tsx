import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "I'm a complete beginner. Is this course for me?",
    answer: "Yes, but with a caveat. While we start from foundational concepts, this course moves fast and expects you to put in the work. If you're looking for a 'get rich quick' scheme, look elsewhere. If you're ready to treat trading like a real profession and commit 10-15 hours per week, you'll succeed here."
  },
  {
    question: "How is this different from free content on YouTube?",
    answer: "YouTube gives you random puzzle pieces. This course gives you the complete picture — in the right order, with the right context, backed by real backtested data. Plus, you get community support, live sessions, and tools you can't find anywhere else. There's a reason our funded rate is 847+ and counting."
  },
  {
    question: "Do you guarantee I'll pass a prop firm challenge?",
    answer: "We can't guarantee results (no one legally can), but we give you everything you need: the exact strategies, risk management, and mental frameworks used by funded traders. Students who complete the program and follow the system have a significantly higher pass rate than the industry average of 5%."
  },
  {
    question: "What markets does this course cover?",
    answer: "The core curriculum focuses on Forex (major and minor pairs), but the concepts apply to indices, gold, and crypto as well. The order flow and price action principles are universal across all liquid markets."
  },
  {
    question: "How long do I have access to the course?",
    answer: "You get 1 full year of access to all course materials, live sessions, and community. After that, you retain lifetime access to all updates and the core video content — only the live weekly sessions require renewal."
  },
  {
    question: "What if I can't attend the live trading sessions?",
    answer: "All live sessions are recorded and uploaded within 24 hours. You can watch them at your convenience and ask questions in the Discord anytime. The recordings include timestamps so you can jump to specific topics."
  },
  {
    question: "Is the Discord actually helpful or just noise?",
    answer: "We run a tight ship. No memes, no pump groups, no BS. It's a focused community of serious traders sharing setups, asking questions, and holding each other accountable. We have dedicated channels for trade ideas, psychology support, and prop firm strategies."
  },
  {
    question: "Can I get a refund if it's not for me?",
    answer: "Absolutely. We offer a 60-day 'Profit or Refund' guarantee. Go through the entire program, implement the strategies, and trade for 60 days. If you don't see measurable improvement, we'll refund your investment plus $100 for your time. We're that confident in the system."
  },
];

const FAQ = () => {
  return (
    <section className="relative py-24 md:py-32 bg-obsidian overflow-hidden">
      <div className="container relative z-10 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="section-label mb-4">FAQ</p>
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              <span className="text-foreground">Questions?</span>
              <br />
              <span className="gold-text">We've Got Answers</span>
            </h2>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border/50 rounded-xl px-6 bg-card/30 data-[state=open]:bg-card data-[state=open]:border-primary/30 transition-all"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-5 text-base md:text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? Reach out directly.
            </p>
            <a 
              href="mailto:support@fundedtraderprotocol.com" 
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              support@fundedtraderprotocol.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
