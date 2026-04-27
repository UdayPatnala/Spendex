import { colors } from "./tokens";

export function formatCurrency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function iconFor(name: string) {
  const map: Record<string, string> = {
    coffee: "local-cafe",
    subway: "directions-subway",
    print: "print",
    restaurant: "restaurant",
    shopping_basket: "shopping-basket",
    directions_car: "directions-car",
    bolt: "bolt",
    wifi: "wifi",
    cloud: "cloud",
    home_work: "home-work",
    fitness_center: "fitness-center",
    bakery_dining: "bakery-dining",
    directions_bus: "directions-bus",
    shopping_bag: "shopping-bag",
    event_busy: "event-busy",
  };
  return map[name] ?? "payments";
}

export function accentPalette(accent: string) {
  const map = {
    mint: {
      bg: colors.secondaryFixed,
      text: colors.secondary,
    },
    amber: {
      bg: colors.tertiaryFixed,
      text: colors.tertiary,
    },
    lavender: {
      bg: colors.lavender,
      text: colors.primary,
    },
    indigo: {
      bg: "#dde2ff",
      text: colors.primary,
    },
  };
  return map[accent as keyof typeof map] ?? map.indigo;
}

