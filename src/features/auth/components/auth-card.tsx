import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

type AuthCardProps = {
  children: ReactNode;
  description: string;
  footer?: ReactNode;
  title: string;
};

export function AuthCard({
  children,
  description,
  footer,
  title,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md gap-6 rounded-2xl py-6 shadow-xl shadow-black/5 sm:py-8">
      <CardHeader className="gap-2 px-6 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        <CardDescription className="leading-6">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 sm:px-8">{children}</CardContent>
      {footer ? (
        <CardFooter className="justify-center px-6 py-4 text-center sm:px-8">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
