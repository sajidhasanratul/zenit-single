import { NextRequest, NextResponse } from 'next/server';
import { getServices, getPricingPlans, getOrders, addLead } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    const query = (message || '').toLowerCase().trim();

    const services = await getServices();
    const plans = await getPricingPlans();
    const orders = await getOrders();

    let reply = "";
    const historyList = Array.isArray(history) ? history : [];
    
    // 1. Check if we are in the middle of a booking flow by looking at the last assistant question
    let isBookingFlow = false;
    let nextStepMessage = "";
    
    if (historyList.length > 0) {
      // Find the last assistant message
      const lastAssistantMsg = [...historyList].reverse().find(h => h.role === 'assistant');
      
      if (lastAssistantMsg) {
        const lastContent = lastAssistantMsg.content.toLowerCase();
        
        if (lastContent.includes('full name')) {
          // User provided Full Name
          isBookingFlow = true;
          nextStepMessage = `Thanks, **${message}**! What is your **Business or Company Name**?`;
        } 
        else if (lastContent.includes('company name')) {
          // User provided Business Name
          isBookingFlow = true;
          nextStepMessage = `Got it. What is a good **Phone Number** we can reach you on?`;
        } 
        else if (lastContent.includes('reach you on')) {
          // User provided Phone Number
          isBookingFlow = true;
          nextStepMessage = `Perfect. What is your **Email Address**?`;
        } 
        else if (lastContent.includes('email address')) {
          // User provided Email
          isBookingFlow = true;
          nextStepMessage = `Great. Lastly, what **Date and Time** works best for your schedule? (e.g., Monday at 3 PM)`;
        } 
        else if (lastContent.includes('works best')) {
          // User provided Date/Time. We compile everything and write to DB!
          isBookingFlow = true;
          
          let fullName = "Anonymous Client";
          let businessName = "Not Provided";
          let phone = "Not Provided";
          let email = "Not Provided";
          const dateTime = message;
          
          // Reconstruct data from history thread
          for (let i = 0; i < historyList.length; i++) {
            const h = historyList[i];
            if (h.role === 'assistant') {
              const contentLower = h.content.toLowerCase();
              if (contentLower.includes('full name') && historyList[i+1]?.role === 'user') {
                fullName = historyList[i+1].content;
              }
              if (contentLower.includes('company name') && historyList[i+1]?.role === 'user') {
                businessName = historyList[i+1].content;
              }
              if (contentLower.includes('reach you on') && historyList[i+1]?.role === 'user') {
                phone = historyList[i+1].content;
              }
              if (contentLower.includes('email address') && historyList[i+1]?.role === 'user') {
                email = historyList[i+1].content;
              }
            }
          }
          
          // Add lead entry to MySQL database
          await addLead({
            fullName,
            businessName,
            phone,
            email,
            selectedPackageCategory: 'custom_bundle',
            selectedItems: ['AI Assistant Booking'],
            totalEstimatedBudgetBDT: 15000,
            sourcePage: `AI Booking: ${dateTime}`,
            submittedAt: new Date().toISOString()
          });
          
          nextStepMessage = `🎉 **Meeting Scheduled Successfully!**\n\n` +
                            `Here are your booking details:\n` +
                            `• **Name:** ${fullName}\n` +
                            `• **Company:** ${businessName}\n` +
                            `• **Phone:** ${phone}\n` +
                            `• **Email:** ${email}\n` +
                            `• **Preferred Time:** ${dateTime}\n\n` +
                            `Our manager will contact you on WhatsApp to confirm the meeting details. Speak soon!`;
        }
      }
    }

    // 2. If we are in the booking flow, return the next step message
    if (isBookingFlow) {
      reply = nextStepMessage;
    } 
    // 3. Otherwise, check if user is triggering the booking flow
    else if (query.includes('book') || query.includes('meeting') || query.includes('schedule') || query.includes('call') || query.includes('appointment')) {
      reply = "I'd love to help you book an onboarding meeting with the ZenIT team! To get started, could you please share your **Full Name**?";
    } 
    // 4. Order status lookup
    else if (orders.some(o => query.includes(o.fullName.toLowerCase()) || query.includes(o.phone.toLowerCase()) || query.includes(o.id.toLowerCase()))) {
      const order = orders.find(o => 
        query.includes(o.fullName.toLowerCase()) || 
        query.includes(o.phone.toLowerCase()) || 
        query.includes(o.id.toLowerCase())
      )!;
      
      reply = `🔍 *Order Status Match Found*\n\n` +
              `• **Order ID:** #${order.id.replace('order-', '')}\n` +
              `• **Client Name:** ${order.fullName}\n` +
              `• **Project Title:** ${order.serviceTitle}\n` +
              `• **Price Cost:** ৳${order.totalBDT.toLocaleString()} BDT\n` +
              `• **Order Status:** *${order.status.toUpperCase()}*\n` +
              `• **Registered At:** ${new Date(order.orderedAt).toLocaleDateString()}\n\n` +
              `Do you want to discuss customization requirements or speed diagnostics for this project on WhatsApp?`;
    } 
    // 5. Services query
    else if (query.includes('service') || query.includes('product') || query.includes('what do you do') || query.includes('offer') || query.includes('list')) {
      const itemsText = services.map(s => 
        `• **${s.title}** (${s.category.replace('_', ' ').toUpperCase()})\n` +
        `  _${s.tagline}_\n` +
        `  *Special Offer Price:* ৳${Math.round(s.pricing.basePriceBDT).toLocaleString()} BDT`
      ).join('\n\n');

      reply = `🖥️ *ZenIT Deployed Services Catalog*\n\n` +
              `Here is our active listing of growth packages:\n\n${itemsText}\n\n` +
              `You can select any of these on our **[Services page](/services)** or discuss them with us!`;
    } 
    // 6. Pricing query
    else if (query.includes('price') || query.includes('pricing') || query.includes('cost') || query.includes('how much') || query.includes('bdt') || query.includes('plan') || query.includes('package')) {
      const plansText = plans.map(p => 
        `• **${p.title}** (${p.category})\n` +
        `  *Price BDT:* ৳${p.pricing.basePriceBDT.toLocaleString()} BDT | Timeline: ${p.deliveryTimeDays} Days\n` +
        `  *Inclusions:* ${p.featuresIncluded.slice(0, 3).join(', ')}...`
      ).join('\n\n');

      reply = `💰 *ZenIT Pricing Packages*\n\n` +
              `Here are our structured pricing plans:\n\n${plansText}\n\n` +
              `You can order these tiers directly via WhatsApp on our **[Pricing page](/pricing)**!`;
    } 
    // 7. Graphics and Design query
    else if (query.includes('design') || query.includes('ui') || query.includes('ux') || query.includes('graphics') || query.includes('figma') || query.includes('logo')) {
      reply = `🎨 *UI/UX & Graphics Design Services*\n\n` +
              `We provide high-fidelity wireframing and user experience layout mapping in Figma, plus graphics design assets including branding identity, icons, and illustrations:\n\n` +
              `• **Figma UI/UX Prototypes:** Interactive mobile-first designs optimized for user conversion loops.\n` +
              `• **High-Fidelity Branding:** Modern logos, banners, social media marketing visuals, and ad banners.\n\n` +
              `Would you like to review some Figma mockups, or include custom UI/UX design in a web development plan?`;
    } 
    // 8. Tech stack query
    else if (
      query.includes('technology') || query.includes('stack') || query.includes('html') || 
      query.includes('css') || query.includes('react') || query.includes('nextjs') || 
      query.includes('postgresql') || query.includes('mongodb') || query.includes('node') || 
      query.includes('javascript') || query.includes('typescript')
    ) {
      reply = `💻 *ZenIT Technology Stack*\n\n` +
              `We build software on standard, high-performance architectures:\n\n` +
              `• **Frontend Web Development:** semantic HTML5, CSS3, JavaScript, TypeScript/TSX, React.js, and Next.js (App Router targets).\n` +
              `• **Server Backend & Database Runtimes:** Node.js, Express, PostgreSQL (for relational data integrity), and MongoDB (for flexible document clustering).\n\n` +
              `This stack enables us to deliver sub-0.5s loading speeds and 100/100 Lighthouse performance metrics. What stack is your current website running on?`;
    } 
    // 9. Digital Marketing query
    else if (query.includes('marketing') || query.includes('capi') || query.includes('pixel') || query.includes('facebook') || query.includes('ads') || query.includes('gtm')) {
      reply = `📈 *Digital Marketing & Conversions tracking*\n\n` +
              `We help ad campaigns scale ROAS and attribution fidelity:\n\n` +
              `• **Meta Pixel & GTM:** Custom Google Tag Manager scripts containers editable from your admin panel.\n` +
              `• **Meta Conversions API (CAPI):** Server-side event dispatching bypassing browser ad blockers to recover up to 35% lost pixel attributions.\n\n` +
              `Are you running active Facebook or Google Ads campaigns?`;
    } 
    // 10. Default fallback
    else {
      reply = `👋 *ZenIT Assistant Sandbox*\n\n` +
              `Thanks for chatting! I am your ZenIT Assistant. I can help you book a meeting, look up pricing plans, catalog services, or track order status.\n\n` +
              `• *Try typing:* "book a meeting" to schedule an onboarding slot directly, or "list services" to query our catalog.`;
    }

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('NLP Chat Playground Failure:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
