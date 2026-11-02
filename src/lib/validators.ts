import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().min(2, "Please enter your full name (at least 2 characters)"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^[+0-9\s-]{7,18}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  service: z.enum(["Visa", "Tickets", "Hotels", "Car Rental"]),
  message: z
    .string()
    .min(10, "Please share a few more details (at least 10 characters)"),
  consent: z.boolean().refine((val) => val === true, {
    message: "Please confirm we may contact you regarding this enquiry",
  }),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

export const visaApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name as shown on passport is required"),
  email: z.string().email("Enter a valid email address for status updates"),
  passportCountry: z.string().min(2, "Please enter your passport nationality"),
  travelDate: z.string().min(1, "Please select an estimated travel date"),
  notes: z.string().optional(),
});

export type VisaApplicationInput = z.infer<typeof visaApplicationSchema>;

export const flightSearchSchema = z
  .object({
    tripType: z.enum(["one-way", "round-trip"]),
    from: z.string().min(2, "Please select or enter an origin city"),
    to: z.string().min(2, "Please select or enter a destination city"),
    departDate: z.string().min(1, "Departure date is required"),
    returnDate: z.string().optional(),
    passengers: z.number().min(1, "At least 1 passenger").max(9, "Max 9 passengers"),
    cabin: z.enum(["Economy", "Business"]),
  })
  .refine((data) => data.from.trim().toLowerCase() !== data.to.trim().toLowerCase(), {
    message: "Origin and destination cities must be different",
    path: ["to"],
  })
  .refine(
    (data) => {
      if (data.tripType === "round-trip") {
        if (!data.returnDate) return false;
        return data.returnDate >= data.departDate;
      }
      return true;
    },
    {
      message: "Return date must be on or after the departure date",
      path: ["returnDate"],
    }
  );

export type FlightSearchInput = z.infer<typeof flightSearchSchema>;

export const hotelSearchSchema = z
  .object({
    destination: z.string().optional(),
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
    guests: z.number().min(1, "At least 1 guest").max(12, "Maximum 12 guests"),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out date must be after check-in date",
    path: ["checkOut"],
  });

export type HotelSearchInput = z.infer<typeof hotelSearchSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
