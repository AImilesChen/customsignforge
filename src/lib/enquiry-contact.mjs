const value=v=>typeof v==='string'?v.trim():'';
export function enquiryContact(record){
 const d=record.details||{};
 const email=value(d.contactEmail)||value(record.customer_email);
 const phone=value(d.phone);
 return {name:value(d.contactName),company:value(d.businessName),email,phone,
  emailURL:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?'mailto:'+encodeURIComponent(email):null,
  phoneURL:/^\+[1-9]\d{6,14}$/.test(phone)?(d.contactMethod==='whatsapp'?'https://wa.me/'+phone.slice(1):'tel:'+phone):null,
  method:d.contactMethod==='whatsapp'?'WhatsApp':'手机',manual:value(d.contact)};
}
