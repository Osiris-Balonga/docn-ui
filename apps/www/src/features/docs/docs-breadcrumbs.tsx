import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function DocsBreadcrumbs({
  current,
  rootHref = "/docs/",
  rootTitle = "Docs",
}: {
  current?: string;
  rootHref?: string;
  rootTitle?: string;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {current ? (
            <BreadcrumbLink render={<Link href={rootHref} />}>
              {rootTitle}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{rootTitle}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {current ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
