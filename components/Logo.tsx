export default function Logo() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="logo"
      src={`${basePath}/logo.png`}
      alt="Mobile Exchange Wala - मोबाईल एक्सचेंज वाला"
      width={688}
      height={706}
      fetchPriority="high"
    />
  );
}
