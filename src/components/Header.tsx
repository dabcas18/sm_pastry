import Link from 'next/link';
import Image from 'next/image';

type HeaderProps = {
  rightContent?: React.ReactNode;
};

export default function Header({ rightContent }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="Sisters & Mom Pastry Shop"
            width={48}
            height={48}
            className="rounded-full"
          />
          <span className="font-script text-gray-800 text-2xl">Sisters & Mom</span>
        </Link>
        {rightContent && <div>{rightContent}</div>}
      </div>
    </header>
  );
}
