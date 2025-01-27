import FileDrop from "@/app/components/fileDrop";

export default function Home() {
    return (
        <div className="grid min-h-screen w-full grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
            <main className="row-start-2 flex w-full flex-col items-center gap-8 px-40">
                <h1 className="absolute left-1/2 top-20 -translate-x-1/2 select-none whitespace-nowrap text-6xl font-semibold">
                    DEEP-IMG
                </h1>

                <FileDrop />
            </main>
        </div>
    );
}
