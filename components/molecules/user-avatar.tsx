import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/avatar";

export interface UserAvatarProps {
  email?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

function getInitials(email?: string): string {
  if (!email) return "U";
  return email.charAt(0).toUpperCase();
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function UserAvatar({ email, imageUrl, size = "md" }: UserAvatarProps) {
  return (
    <Avatar className={sizeMap[size]}>
      <AvatarImage src={imageUrl} alt={email} />
      <AvatarFallback>{getInitials(email)}</AvatarFallback>
    </Avatar>
  );
}
