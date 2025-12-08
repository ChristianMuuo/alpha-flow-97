import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "I'm a complete beginner. Is Obsidian Desk for me?",
    answer: "Yes, but with a caveat. We start from foundational concepts, but this program moves fast and expects you to put in 10-15 hours per week. The AI co-pilot adapts to your level, but you need to show up. If you're looking for 'get rich quick,' look elsewhere. If you're ready to treat trading like a real profession, you'll thrive here."
  },
  {
    question: "How is this different from every other Forex course?",
    answer: "Three things: (1) AI integration — no other course has a 24/7 AI co-pilot that scans markets, alerts setups, and analyzes your psychology. (2) Real institutional tools — Bookmap order flow, COT dashboards, and volume profile all integrated. (3) Results — 1,247+ funded traders and a 90-day funded guarantee. We put our money where our mouth is."
  },
  {
    question: "What exactly is the AI Trading Co-Pilot?",
    answer: "It's a custom AI trained on 10+ years of institutional trading data. It scans charts 24/7 and alerts you ONLY when A+ setups matching your strategy appear. It analyzes your trade journal and identifies psychological patterns. It can backtest any idea you describe in plain English in seconds. And yes, it roasts your bad trades with dark humor."
  },
  {
    question: "Do you guarantee I'll pass a prop firm challenge?",
    answer: "We guarantee that if you complete the program, follow the system for 90 days, and don't pass a prop firm challenge OR see measurable improvement — we'll refund your investment PLUS give you $500 cash. Our 1,247+ funded traders weren't accidents. But you have to do the work."
  },
  {
    question: "What prop firms does this work for?",
    answer: "All of them. FTMO, The5ers, Topstep, MyFundedFX, True Forex Funds — the strategies and risk management protocols are universal. We have dedicated modules for each firm's specific rules and a simulated challenge environment to practice before you risk real money."
  },
  {
    question: "How long do I have access?",
    answer: "1 full year of access to all live features: AI co-pilot, community, Desk Broadcasts, and weekly office hours. After that, you retain lifetime access to all course content, indicators, and the Black Book. You can renew the live features annually if you want, but you keep everything else forever."
  },
  {
    question: "What if I can't attend the live Desk Broadcasts?",
    answer: "All live sessions are recorded and uploaded within 2 hours. The AI generates a transcript and key takeaways automatically. You can catch up at your convenience and ask questions in the community anytime. We serve traders in every timezone."
  },
  {
    question: "Why only 1,000 lifetime members?",
    answer: "Quality over quantity. Our AI systems, community engagement, and mentor bandwidth are calibrated for 1,000 serious traders. We'd rather have 1,000 funded professionals than 10,000 lurkers. When spots are filled, this offer closes permanently. No waitlist, no exceptions."
  },
  {
    question: "Can I get a refund if it's not for me?",
    answer: "Yes. 90-day 'Funded or Free' guarantee. Complete the program, follow the system, and if you don't pass a prop firm challenge or see measurable improvement, we'll refund your investment PLUS give you $500 cash. We're that confident because the system works."
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
              <span className="gold-text">Answers.</span>
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
              href="mailto:support@obsidiandesk.com" 
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              support@obsidiandesk.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
