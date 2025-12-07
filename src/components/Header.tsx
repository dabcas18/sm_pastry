import Link from 'next/link';
import Image from 'next/image';

type HeaderProps = {
  rightContent?: React.ReactNode;
};

export default function Header({ rightContent }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="Sisters & Mom Pastry Shop"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="font-script text-gray-800 text-xl">Sisters & Mom</span>
        </Link>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
