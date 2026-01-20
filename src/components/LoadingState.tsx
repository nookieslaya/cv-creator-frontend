type LoadingStateProps = {
  label?: string;
};

export default function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return <div className="rounded-2xl bg-white p-6 text-sm text-slate">{label}</div>;
}
