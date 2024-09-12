import { ProgressBar } from "react-bootstrap";

const Progress = ( {tokensSold, maxTokens} ) => {
    return(
        <div className="my-3">
            {/* now -> current progress
                written into a percentage */}
            <ProgressBar now={((tokensSold / maxTokens) * 100 )} label={`${(tokensSold / maxTokens)  * 100 }%`} />
            <p className="text-center my-3"> {tokensSold} / {maxTokens} Tokens Sold </p>
        </div>
    )
}

export default Progress;
