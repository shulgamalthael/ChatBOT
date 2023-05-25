import { FC, MouseEvent } from "react";
import { ReactChildren } from "../../interfaces/children";
import SaveButton from "../common/SaveButton";

interface ISectionProps {
	title?: string;
	children: ReactChildren;
	skipMarginBottom?: boolean;
	save?: (e: MouseEvent<HTMLElement>) => void;
}

const Section: FC<ISectionProps> = ({ title, skipMarginBottom, children, save }) => {
	const baseClassName = "section";
	const className = skipMarginBottom ? baseClassName : `${baseClassName} mb-5`;

	return(
		<section className={className}>
			<div className="section-title">{title}</div>
			<div className="section-solid" />
			{children}
			{save && (
				<div className="flex flex-end mb-5">
					<SaveButton click={save} />
				</div>
			)}
			<div className="section-solid" />
		</section>
	)
}

export default Section;