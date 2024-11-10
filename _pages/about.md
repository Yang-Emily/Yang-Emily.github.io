---
permalink: /
title: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

About Me
======
<!-- <h2 style="background-color: #f4f4f4; margin-bottom: 20px; padding: 10px; color: #FF9999; background: #FFFFFF;">I will be in Santiago, Chile in June for SIGMOD 2024!</h2> -->
I am currently pursuing my Master's degree in the School of Computer Science and Technology at **Huazhong University of Science and Technology** ([**HUST**](https://www.hust.edu.cn/)), advised by Prof. [**Yao Wan**](http://wanyao.me/). I am a member of the CGCL laboratory led by Prof. [**Hai Jin**](https://scholar.google.ca/citations?user=o02W0aEAAAAJ&hl=en).

I am actively seeking a PhD position in SE/ML/HCI for 2025 fall.    
You’re welcome to download my **CV** [here](../assets/YangWu_CV.pdf) and **Transcript** [here](../assets/Transcript.pdf). Contact: [wuyang991107@gmail.com](mailto:wuyang991107@gmail.com)    
<!-- Contact: wuyang_emily@hust.edu.cn -->




Research Interests
======
<!-- My primary research interest lies in code intelligence, including code summarization and code generation, with a specific focus on natural language to visualization (NL2Vis). I am particularly interested in leveraging AI in the applications of tabular data and visualization. -->
<!-- My primary research interest lies in the intersection between Software Engineering and Human-Computer Interaction, including source code generation and summarization, with a specific focus on the universality of natural language, source code and data visualizations with AI tools. -->

My primary research interest lies in the intersection between <span style="color:lightblue;">**Software Engineering**</span> and <span style="color:orange;">**Human-Computer Interaction**</span>, including *source code generation* and *summarization*, with a specific focus on the universality of *natural language*, *programming language*, and *data visualizations* with <span style="color:lightcoral;">**AI tools**</span>.


<div style="text-align:center;">
    <svg id="vennDiagram" width="500" height="360"></svg>
<!-- External text placed using divs outside the Venn diagram -->
    <div style="display: flex; justify-content: space-between; margin-top: -300px;">
        <div style="text-align: left;"> 
            <!-- <p>NL2Vis, SIGMOD'24</p> -->
            <p>CFExplainer, ISSTA'24</p>
            <p>CodeSum-Eval, ICSE'25</p>
        </div>
        <div style="text-align: right;">
            <p>NL2Vis, SIGMOD'24</p>
            <!-- <p>ExplainVis, CHI'25</p> -->
            <p>Sign Visualizer, CHI'25</p>
        </div>
    </div>

    <div style="text-align: center; margin-top: 180px;">
        <!-- <p>CFExplainer, ISSTA'24</p> -->
    </div>
</div>

<script src="https://d3js.org/d3.v5.min.js"></script>
<script>
    var svg = d3.select("#vennDiagram");

    var circlesData = [
        { cx: 240, cy: 150, r: 110, color: "orange", label: "Human-Computer Interaction" },
        { cx: 140, cy: 250, r: 110, color: "lightblue", label: "Software Engineering" },
        { cx: 340, cy: 250, r: 110, color: "lightcoral", label: "Artificial Intelligence" }
    ];

    var circles = svg.selectAll("circle")
        .data(circlesData)
        .enter()
        .append("circle")
        .attr("cx", d => d.cx)
        .attr("cy", d => d.cy)
        .attr("r", d => d.r)
        .attr("fill", d => d.color)
        .attr("class", "circle")
        .on("click", function (event, d) {
            circles.classed("highlight", false);
            d3.select(this).classed("highlight", true);
        });

    svg.selectAll("text")
        .data(circlesData)
        .enter()
        .append("text")
        .attr("x", d => d.cx)
        .attr("y", d => d.cy)
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(d => d.label)
        .style("font-size", "18px")  // Increased font size
        .style("font-weight", "bold");  // Bold font

    // Add labels for the intersection areas
    var intersectionLabels = [
        { x: 130, y: 100, text: "NL2Vis, CodeSum-Eval" },
        <!-- { x: 370, y: 100, text: "Sign2Vis, ExplainVis" }, -->
        { x: 240, y: 370, text: "CFExplainer" }
    ];

    svg.selectAll(".intersection-text")
        .data(intersectionLabels)
        .enter()
        .append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("text-anchor", "middle")
        .text(d => d.text)
        .style("font-size", "14px");

    // Tooltip for hover effect
    circles.on("mouseover", function(event, d) {
        svg.append("text")
            .attr("id", "tooltip")
            .attr("x", d.cx)
            .attr("y", d.cy - d.r - 10)
            .attr("text-anchor", "middle")
            .text(`This is ${d.label}`);
    }).on("mouseout", function() {
        d3.select("#tooltip").remove();
    });
</script>

<style>
    .circle {
        fill-opacity: 0.5;
        transition: transform 0.3s ease, fill-opacity 0.3s ease;
    }
    .circle:hover {
        cursor: pointer;
    }
    .highlight {
        fill-opacity: 1;
        transform: scale(1.1);
    }
</style>

News
======
- [2024-05-14] Awarded the **_Student Support Scholarship_** at **<span style="color: #FF9999;">SIGMOD 2024</span>**. Traveling to **<span style="color: #FF9999;">Chile</span>** to present my paper.
- [2024-11-01] Arrived at **<span style="color: #FF9999;">ETH Zurich</span>** for a visit to the **_Peach Lab_**.

Publication
======
<div class='paper-box'>
<div class='paper-box-image'>
<div>
<div class="badge">
</div>
<img src='../assets/p1.png' alt="sym" width="100%">
</div>
</div>
<div class='paper-box-text' markdown="1">

**Automated Data Visualization from Natural Language via Large Language Models: An Exploratory Study**  
  **Yang Wu**, Yao Wan\*, Hongyu Zhang, Yulei Sui, Wucai Wei, Wei Zhao, Guandong Xu, Hai Jin  
  [**SIGMOD 2024**](https://2024.sigmod.org/). *ACM Special Interest Group on Management of Data*  
  [PDF](../files/Automated_Data_Visualization_from_Natural_Language_via_Large_Language_Models_An_Exploratory_Study.pdf) | [CCF-A](#) | [Arxiv](https://arxiv.org/abs/2404.17136)
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge"></div><img src='../assets/p2.png' alt="sym" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

**Graph Neural Networks for Vulnerability Detection - A Counterfactual Explanation**  
  Zhaoyang Chu, Yao Wan\*, Qian Li, **Yang Wu**, Hongyu Zhang, Yulei Sui, Guandong Xu, Hai Jin  
  [**ISSTA 2024**](https://2024.issta.org/). *The ACM SIGSOFT International Symposium on Software Testing and Analysis*  
  [PDF](../files/istta24_code_gnn_explainer.pdf) | [CCF-A](#) | [Arxiv](https://arxiv.org/abs/2404.15687)
  
  </div>
</div>

Project
======
- **Exploring LLMs as Evaluator for Code Summarization**
First Author, Submitted to [**ICSE 2025**](https://conf.researchr.org/home/icse-2025).


<!-- - **Explainable NL2Vis: Opening the Black Box of Automated Visualizations**
<!-- First Author, Submitted to [**CHI 2025**](https://chi2025.acm.org/). -->

- **Interactive Data Visualization Through Sign Language**
First Author after advisor, Submitted to [**CHI 2025**](https://chi2025.acm.org/). 

# Internships
- *June 2024 - September 2024*, [**ETH Zurich**](https://ethz.ch/en.html), in the Programming, Education, and Computer-Human Interaction Lab ([**PEACH Lab**](https://peachlab.inf.ethz.ch/#/peach)), supervised by Prof. [**April Yi Wang**](https://peachlab.inf.ethz.ch/#/home).

<!-- ======  -->
<!-- <div style="display: flex; align-items: center; margin-bottom: 20px;">
    <img src="../assets/publication_image.png" alt="Automated Data Visualization" style="width: 150px; height: auto; margin-right: 20px;" />
    <div>
        <h3>Automated Data Visualization from Natural Language via Large Language Models: An Exploratory Study</h3>
        <p>
            **Yang Wu**, Yao Wan*, Hongyu Zhang, Yulei Sui, Wucai Wei, Wei Zhao, Guandong Xu, Hai Jin<br />
            [**SIGMOD 2024**](https://2024.sigmod.org/). *ACM Special Interest Group on Management of Data*<br />
            This study explores automated data visualization techniques using large language models.
        </p>
        <a href="../files/Automated_Data_Visualization_from_Natural_Language_via_Large_Language_Models_An_Exploratory_Study.pdf" style="text-decoration: none; color: #FF9999;">Paper</a>
    </div>
</div>

<div style="display: flex; align-items: center; margin-bottom: 20px;">
    <img src="../assets/ongoing_publication_image.png" alt="Ongoing Research" style="width: 150px; height: auto; margin-right: 20px;" />
    <div>
        <h3>On-going, First Author, Submitted to ICSE 2025</h3>
        <p>
            This work focuses on innovative approaches in Software Engineering and is currently under review for ICSE 2025.
        </p>
    </div>
</div>

<div style="display: flex; align-items: center; margin-bottom: 20px;">
    <img src="../assets/gnn_publication_image.png" alt="Graph Neural Networks" style="width: 150px; height: auto; margin-right: 20px;" />
    <div>
        <h3>Graph Neural Networks for Vulnerability Detection - A Counterfactual Explanation</h3>
        <p>
            Zhaoyang Chu, Yao Wan*, Qian Li, **Yang Wu**, Hongyu Zhang, Yulei Sui, Guandong Xu, Hai Jin<br />
            [**ISSTA 2024**](https://2024.issta.org/). *The ACM SIGSOFT International Symposium on Software Testing and Analysis*<br />
            This paper investigates the application of graph neural networks for detecting software vulnerabilities.
        </p>
        <a href="../files/istta24_code_gnn_explainer.pdf" style="text-decoration: none; color: #FF9999;">Paper</a>
    </div>
</div> -->



Honors
======
- Excellent Student Cadre (2022-2023)
- First-class Scholarship for Postgraduates (2022-2023)
- Outstanding Undergraduate (2022)
- National Inspirational Scholarship (2018-2021)

Hobbies
======
- Reading, hiking.
<script type="text/javascript" src="//rf.revolvermaps.com/0/0/6.js?i=54e0ojatafc&amp;m=7&amp;c=e63100&amp;cr1=ffffff&amp;f=arial&amp;l=0&amp;bv=90&amp;lx=-420&amp;ly=420&amp;hi=20&amp;he=7&amp;hc=a8ddff&amp;rs=80" async="async"></script>