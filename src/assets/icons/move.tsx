function MoveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 24 24"
      focusable="false"
      fill="currentColor"
      {...props}
    >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10zm-8.01-9l-1.41 1.41L12.16 12H8v2h4.16l-1.59 1.59L11.99 17 16 13.01 11.99 9z"></path>
    </svg>
  );
}
export default MoveIcon;
