import { Button } from '@mantine/core';
import { Shield, Cpu, Github, FileSearch } from 'lucide-react';
import styles from './page.module.css';

const features = [
  {
    icon: <Shield size={20} />,
    title: 'OSV Vulnerability Scanning',
    description: 'Automatically checks your dependencies against the OSV database before every commit.',
  },
  {
    icon: <Cpu size={20} />,
    title: 'Local AI Code Review',
    description: 'Smart analysis powered by a small, fast model running locally through Ollama. No data leaves your machine.',
  },
  {
    icon: <Github size={20} />,
    title: 'GitHub Integration',
    description: 'Connect your repositories for seamless collaboration and centralized quality tracking.',
  },
  {
    icon: <FileSearch size={20} />,
    title: 'Smart Diff Analysis',
    description: 'Only reviews meaningful changes — noise files like lockfiles and images are filtered automatically.',
  },
];

export default function Home() {
  return (
    <div className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          in development
        </div>

        <h1 className={styles.title}>
          Code quality gates,{' '}
          <span className={styles.gradientText}>powered by AI</span>
        </h1>

        <p className={styles.subtitle}>
          DevAI is a local CLI agent that scans your staged commits for vulnerabilities
          and code quality issues — using a fast local AI model, not cloud APIs.
        </p>

        <div className={styles.actions}>
          <Button
            size="lg"
            radius="xl"
            variant="gradient"
            gradient={{ from: 'violet', to: 'cyan', deg: 135 }}
            leftSection={<Github size={18} />}
            component="a"
            href="#"
          >
            Connect GitHub
          </Button>
          <Button
            size="lg"
            radius="xl"
            variant="default"
            component="a"
            href="https://github.com/doveyQ/devai"
            target="_blank"
          >
            View on GitHub
          </Button>
        </div>
      </div>

      <div className={styles.features}>
        {features.map((feature) => (
          <div key={feature.title} className={styles.featureCard}>
            <div className={styles.featureIcon}>{feature.icon}</div>
            <div className={styles.featureTitle}>{feature.title}</div>
            <div className={styles.featureDesc}>{feature.description}</div>
          </div>
        ))}
      </div>

      <footer className={styles.footer}>
        DevAI &mdash; AI-powered code quality gate &middot; MIT License
      </footer>
    </div>
  );
}
