import ScrambleText from './ScrambleText';

/** `[01] ~/whoami ———` header strip used at the top of every section. */
export default function SectionMeta({ index, path }) {
  return (
    <div className="sec-meta">
      <span className="tag">{index}</span>
      <ScrambleText className="sec-meta__path" text={path} />
      <span className="sec-meta__rule" aria-hidden="true" />
    </div>
  );
}
