import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { NavInfoCard } from "../../types/navInfoCard";

export default function LinkNavCard({ title, shortDescription, content, href, d }: NavInfoCard) {

  return (

    <Link href={href} className="w-full md:w-1/3 group" >

        <Card className="border border-transparent hover:border-[var(--primary)] transition-all duration-300 ease-in-out hover:shadow-lg h-full" >

            <CardHeader>

                <div className="flex flex-row items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
                        className={"size-5 transition-colors  md:group-hover:text-[var(--primary)] md:text-gray-400 text-[var(--primary)]"}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                    </svg>
                    <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
                </div>

                <CardDescription className="text-xs md:text-sm">
                {shortDescription}
                </CardDescription>
            </CardHeader>

            <CardContent>

                <p className="text-base">{content}</p>
                
            </CardContent>

        </Card>

        </Link>

  );

}