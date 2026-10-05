export interface WhatsAppEnquiryParams {
  phoneNumber?: string | null;
  type?: 'product' | 'custom_jersey' | 'category' | 'general';
  productName?: string;
  categoryName?: string;
  quantity?: string | number;
  customDetails?: {
    teamName?: string;
    fabricName?: string;
    quantity?: string | number;
    requirements?: string[];
    notes?: string;
  };
  customMessage?: string;
}

/**
 * Normalizes phone numbers to international format without plus, spaces, or dashes
 * Default fallback is empty string (prompting user to configure WhatsApp)
 */
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Builds a contextual WhatsApp link using the company WhatsApp number from Supabase
 */
export function generateWhatsAppLink(params: WhatsAppEnquiryParams): string {
  const phone = formatPhoneNumber(params.phoneNumber);

  let message = '';

  if (params.customMessage) {
    message = params.customMessage;
  } else {
    switch (params.type) {
      case 'product':
        if (params.productName) {
          message = `Hi DFD Sports, I am interested in *${params.productName}*. Please share more details, available variants, and a quotation.`;
          if (params.quantity) {
            message += ` Approximate Quantity: ${params.quantity}.`;
          }
        } else {
          message = `Hi DFD Sports, I am interested in your sports products. Please share more details and a quotation.`;
        }
        break;

      case 'category':
        if (params.categoryName) {
          message = `Hi DFD Sports, I am interested in your *${params.categoryName}* sports equipment & gear. Please share your catalog and quotations.`;
        } else {
          message = `Hi DFD Sports, I would like to enquire about your sports equipment range.`;
        }
        break;

      case 'custom_jersey':
        message = `Hi DFD Sports, I am interested in *Custom Team Jerseys & Teamwear*.`;
        if (params.customDetails) {
          const { teamName, fabricName, quantity, requirements, notes } = params.customDetails;
          if (teamName) message += `\n• Team / Org: ${teamName}`;
          if (fabricName) message += `\n• Preferred Fabric: ${fabricName}`;
          if (quantity) message += `\n• Estimated Quantity: ${quantity}`;
          if (requirements && requirements.length > 0) {
            message += `\n• Customization: ${requirements.join(', ')}`;
          }
          if (notes) message += `\n• Additional Notes: ${notes}`;
        }
        message += `\n\nPlease share available design templates, fabric samples, pricing and timeline.`;
        break;

      case 'general':
      default:
        message = `Hi DFD Sports, I would like to know more about your sports products, custom teamwear and equipment supply.`;
        break;
    }
  }

  const encodedMessage = encodeURIComponent(message.trim());

  if (!phone) {
    // If WhatsApp number is not yet set in database, link directly to web whatsapp or a placeholder
    return `https://wa.me/?text=${encodedMessage}`;
  }

  return `https://wa.me/${phone}?text=${encodedMessage}`;
}
