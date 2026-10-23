import type { Topic } from "@/lib/content/schema";

export function ProjectStep({ project }: { project: Topic["project"] }) {
  return (
    <>
      <div>
        <h3>이런 상황에서 만나요</h3>
        <div className="scen">
          <b>상황</b> {project.scenario}
        </div>
      </div>
      <div>
        <h3>원인</h3>
        <p className="prose">{project.why}</p>
      </div>
      <div>
        <h3>해결 방법</h3>
        <ul className="fix">
          {project.fixes.map(([name, desc]) => (
            <li key={name}>
              <i>{name}</i>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>포트폴리오·면접에서 이렇게 말하기</h3>
        <div className="resume">
          <p>{project.resume}</p>
        </div>
      </div>
    </>
  );
}
