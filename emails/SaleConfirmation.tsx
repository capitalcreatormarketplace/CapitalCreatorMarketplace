import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from '@react-email/components';
import { InventoryItem, UserProfile } from '../types';

interface SaleConfirmationEmailProps {
  creator: UserProfile;
  sponsor: UserProfile;
  item: InventoryItem;
}

const baseUrl = 'https://capitalcreator.market'; // Dummy base URL

export const SaleConfirmation: React.FC<SaleConfirmationEmailProps> = ({
  creator,
  sponsor,
  item,
}) => (
  <Html>
    <Head />
    <Preview>Capital Creator: Your inventory spot has been sold!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
            <Text style={logoText}>CAPITAL<span style={logoTextGold}>CREATOR</span></Text>
        </Section>
        <Heading style={h1}>INVENTORY SOLD</Heading>
        <Text style={text}>
          Congratulations, {creator.name}! Your ad placement for the upcoming stream has been purchased by{' '}
          <strong>{sponsor.name}</strong>.
        </Text>
        
        <Hr style={hr} />

        <Section style={itemDetails}>
            <Row>
                <Column>
                    <Text style={itemHeader}>ITEM</Text>
                    <Text style={itemValue}>{item.creatorName} - {item.streamTime}</Text>
                </Column>
            </Row>
             <Row>
                <Column>
                    <Text style={itemHeader}>SPONSOR</Text>
                    <Text style={itemValue}>{sponsor.name} ({sponsor.address.slice(0,6)}...{sponsor.address.slice(-4)})</Text>
                </Column>
            </Row>
             <Row>
                <Column>
                    <Text style={itemHeader}>SETTLEMENT</Text>
                    <Text style={itemValue}>${item.priceSol} USDC</Text>
                </Column>
            </Row>
        </Section>

        <Hr style={hr} />

        <Text style={text}>
          The funds have been routed to your connected wallet. Here are the next steps:
        </Text>
        <Text style={steps}>
          <strong>1. Await Contact:</strong> The sponsor may reach out to you at{' '}
          <Link href={`mailto:${creator.email}`} style={link}>{creator.email}</Link> with their brand assets (logo, links, etc.).
        </Text>
        <Text style={steps}>
          <strong>2. Prepare for Stream:</strong> Ensure you have everything needed to fulfill the ad placement as described in your listing.
        </Text>
         <Text style={steps}>
          <strong>3. Go Live:</strong> Execute the sponsorship during your stream on {item.streamTime}.
        </Text>
        <Text style={text}>
          Thank you for using the Capital Creator marketplace.
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          Capital Creator Protocol, 2026
        </Text>
      </Container>
    </Body>
  </Html>
);

export default SaleConfirmation;

// Styles
const main = {
  backgroundColor: '#000000',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  color: '#ffffff',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  marginTop: '20px',
  backgroundColor: '#0a0a0a'
};

const logoContainer = {
    textAlign: 'center' as const,
    padding: '20px 0',
};

const logoText = {
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '-1px',
    margin: 0,
    color: '#ffffff',
}

const logoTextGold = {
    ...logoText,
    color: '#BF953F'
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
  padding: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.3em',
};

const text = {
  color: '#cccccc',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 40px',
};

const steps = {
    ...text,
    padding: '0 40px 0 60px'
}

const hr = {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    margin: '30px 40px'
}

const itemDetails = {
    padding: '0 40px'
}

const itemHeader = {
    color: '#888888',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    margin: '0 0 5px 0'
}

const itemValue = {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 15px 0'
}

const link = {
  color: '#BF953F',
  textDecoration: 'underline',
};

const footer = {
  color: '#888888',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};