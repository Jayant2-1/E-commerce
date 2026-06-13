export default function ImagePlaceholder({ className, text }) {
  return <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#141414', color: '#6b6b6b', fontFamily: "'Cormorant Garamond', serif", fontSize: '0.8rem' }}>{text || 'Image'}</div>;
}
