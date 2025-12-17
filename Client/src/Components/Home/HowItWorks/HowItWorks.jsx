import React from 'react';
import { LuSparkles, LuPenLine, LuHammer, LuSend } from 'react-icons/lu';

const steps = [
	{
		id: 1,
		title: 'Select',
		description: 'Curate from limited-edition drops, mood-based hampers, and artist collaborations.',
		icon: LuSparkles,
	},
	{
		id: 2,
		title: 'Personalize',
		description: 'Add engraved notes, monograms, voice snippets, and custom palettes.',
		icon: LuPenLine,
	},
	{
		id: 3,
		title: 'Craft',
		description: 'Our artisans handcraft, photograph, and quality-check every detail.',
		icon: LuHammer,
	},
	{
		id: 4,
		title: 'Deliver',
		description: 'White-glove delivery with live tracking, climate-safe packaging, and reminders.',
		icon: LuSend,
	},
];

const HowItWorks = () => (
	<section className="bg-[#ecf7f5] py-12">
		<div className="mx-auto w-11/12 max-w-6xl text-center">
			<p className="text-xs uppercase tracking-[0.5em] text-[#4a7c73]">How it works</p>
			<h2 className="mt-3 text-2xl font-semibold text-[#1f1b16] md:text-3xl font-serif">
				Emotionally engineered, logistically perfected
			</h2>
			<p className="mx-auto mt-4 max-w-3xl text-sm text-[#4b453d]">
				Every order is a micro production—designed with you, co-created with artisans, and delivered with accountability.
			</p>

			<div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				{steps.map((step, idx) => {
					const Icon = step.icon;
					return (
						<article
							key={step.id}
							className="relative rounded-[24px] border border-white/70 bg-white p-6 text-left shadow-[0_15px_40px_rgba(31,27,22,0.07)]"
						>
							{idx < steps.length - 1 && (
								<span className="pointer-events-none absolute right-[-10%] top-1/2 hidden h-1 w-12 -translate-y-1/2 bg-[#88b1a7] md:block" />
							)}
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f5a50]/10 text-[#2f5a50]">
								<Icon className="text-xl" />
							</div>
							<p className="mt-4 text-4xl font-semibold text-[#2f5a50]">{String(step.id).padStart(2, '0')}</p>
							<h3 className="mt-3 text-xl font-semibold text-[#1f1b16] font-serif">{step.title}</h3>
							<p className="mt-2 text-sm text-[#4b453d]">{step.description}</p>
						</article>
					);
				})}
			</div>
		</div>
	</section>
);

export default HowItWorks;
