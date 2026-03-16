interface Props {
  children: any;
}

export default function Page({ children }: Props) {
  return (
    <div class="book-page prose prose-zinc dark:prose-invert max-w-none prose-h1:mt-0 prose-h2:mt-0 prose-p:mb-4 flex-1">
      {children}
    </div>
  );
}
