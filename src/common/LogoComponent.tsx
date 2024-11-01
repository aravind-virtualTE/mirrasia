interface LogoProps {
    width?: number;
    height?: number;
  }
  
  const Logo: React.FC<LogoProps> = ({ width = 30, height = 30 }) => {
    return (
      <svg width={width} height={height} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="40" height="40" fill="red" />
        <rect x="50" y="0" width="40" height="40" fill="red" />
        <rect x="50" y="50" width="40" height="40" fill="red" />
      </svg>
    );
  };
  
  export default Logo;