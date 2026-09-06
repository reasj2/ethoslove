import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

export const EMAIL_BRAND = { name: "Ethos", site: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ethoslove.com", from: process.env.EMAIL_FROM ?? "Ethos <hello@ethoslove.com>" };

const paper = "#FAF7F2";
const ink = "#1A1614";
const coral = "#E8604C";
const muted = "#6F665F";

export function EmailLayout({ preview, heading, children, cta, footer }: { preview: string; heading: string; children: ReactNode; cta?: { label: string; href: string }; footer: string }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, background: paper, fontFamily: "Inter, -apple-system, Segoe UI, sans-serif", color: ink }}>
        <Container style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px 32px" }}>
          <Section style={{ marginBottom: 28 }}>
            <Img src={`${EMAIL_BRAND.site}/icon-email.png`} width="36" height="36" alt={EMAIL_BRAND.name} style={{ display: "block" }} />
          </Section>
          <Heading as="h1" style={{ fontFamily: "Georgia, 'Iowan Old Style', serif", fontStyle: "italic", fontWeight: 400, fontSize: 30, lineHeight: 1.15, margin: "0 0 18px", letterSpacing: -0.3 }}>
            {heading}
          </Heading>
          <Section style={{ fontSize: 16, lineHeight: 1.6, color: ink }}>{children}</Section>
          {cta ? (
            <Section style={{ margin: "28px 0 8px" }}>
              <Button href={cta.href} style={{ background: coral, color: "#FFF8F4", borderRadius: 999, padding: "13px 22px", fontWeight: 600, fontSize: 15, textDecoration: "none", display: "inline-block" }}>
                {cta.label}
              </Button>
            </Section>
          ) : null}
          <Hr style={{ borderColor: "#E6DFD4", margin: "32px 0 16px" }} />
          <Text style={{ fontSize: 12, lineHeight: 1.6, color: muted, margin: 0 }}>
            {footer} · <Link href={EMAIL_BRAND.site} style={{ color: muted }}>{EMAIL_BRAND.site.replace(/^https?:\/\//, "")}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const P = ({ children }: { children: ReactNode }) => <Text style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.6 }}>{children}</Text>;
export const Quiet = ({ children }: { children: ReactNode }) => <Text style={{ margin: "0 0 14px", fontSize: 14, lineHeight: 1.6, color: muted }}>{children}</Text>;
