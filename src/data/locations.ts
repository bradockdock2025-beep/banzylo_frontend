export interface StoreLocation {
  name: string;
  address: string[];
  hours: string[];
  phone: string;
}

// Extracted from the real hypmiami.com Locations page.
export const LOCATIONS: StoreLocation[] = [
  {
    name: "Mary Brickell Village",
    address: ["900 S. Miami Avenue", "Suite 182", "Miami, FL 33130"],
    hours: ["Mon-Thu: 12:00 pm - 8:00 pm", "Fri-Sat: 11:00 pm - 9:00 pm", "Sun: 11:00 am - 8:00 pm"],
    phone: "+1 (786)-536-6671",
  },
  {
    name: "Miami World Center",
    address: ["851 NE 1st Ave", "Suite D120", "Miami, FL 33132"],
    hours: ["Mon-Thu: 12:00 pm - 8:00 pm", "Fri-Sat: 11:00 pm - 9:00 pm", "Sun: 11:00 am - 8:00 pm"],
    phone: "+1 (786)-422-5086",
  },
];
