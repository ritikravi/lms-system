export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <span>© 2026 <strong>Lovely Professional University</strong> — Library Management System | Phagwara, Punjab</span>
        <span>📞 1800-102-4057</span>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#1a1a1a', color: '#9ca3af',
    padding: '16px 20px', fontSize: 13,
  },
  inner: {
    maxWidth: 1200, margin: '0 auto',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 8,
  },
};
