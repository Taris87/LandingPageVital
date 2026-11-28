/*
  Service details shown in the "Learn more" pop-up.

  How to add or change information:
  - Each key (taping, training, massage) matches data-info="..." on a "Learn more" button
    in index.html.
  - title:         heading of the pop-up.
  - summary:       short introduction at the top of the pop-up.
  - points:        short highlights shown as a list.
  - sectionsTitle: small heading above the sections (leave "" when there are no sections).
  - sections:      optional blocks with a heading and text. Add new blocks here.
  - source:        optional note on where the information comes from (leave "" to hide it).
  - A new service needs a new key here and a button with the same data-info value.
  - Use plain text only (no HTML); quotes inside a text need a backslash: \"like this\".
  - After editing, raise the ?v= number of service-info.js in index.html so browsers
    load the new version.
*/
window.SERVICE_INFO = {
  taping: {
    title: "Kinesiology Taping",
    summary:
      "Kinesiology tape offers various specific uses. A physical therapist can evaluate your condition to determine the most effective application.",
    points: ["Supports movement", "Eases pain and spasms", "Stabilizes with athletic taping"],
    sectionsTitle: "How kinesiology tape is used",
    sections: [
      {
        heading: "Allowing motion",
        text: "Kinesiology tape can be used to help improve muscular firing and contraction patterns. This can lead to normalized muscle tone and can also help improve athletic performance, although some studies suggest the benefit is linked to a placebo effect."
      },
      {
        heading: "Inhibition and pain management",
        text: "Kinesiology tape may help to decrease pain and muscle spasms. It can help reduce nerve pain signals to the brain, which can help decrease muscle guarding and protective spasms."
      },
      {
        heading: "Support and stability",
        text: "If you have a condition that requires a specific joint to be held in place, kinesiology taping may be right for you. Conditions like patellofemoral stress syndrome, iliotibial band friction syndrome and shoulder instability may benefit from the extra support provided by kinesiology tape. The tape can support your joint while still allowing for some motion."
      },
      {
        heading: "Decreasing swelling",
        text: "If you have swelling from an injury or surgery, kinesiology tape may help decrease it by reducing pressure between the skin and the underlying tissues. This provides a pathway for excess fluid to drain."
      },
      {
        heading: "Scar tissue management",
        text: "After surgery or trauma, such as burns, scars can form. Sometimes the tissue underneath the scar binds to your skin and the underlying fascia, limiting mobility and range of motion. Kinesiology tape can be used to manage scar tissue formation."
      }
    ],
    source: "From our Facebook post “How Kinesiology Tape Is Used,” November 27, 2026."
  },

  training: {
    title: "Personal Medical Training",
    summary:
      "One-to-one sessions tailored to you and your goals, for everyday life, after an injury or to stay active.",
    points: ["Tailored sessions", "Increased strength and mobility", "Improved energy levels"],
    sectionsTitle: "",
    sections: [
      // Add more information here, for example:
      // { heading: "What a session looks like", text: "…" }
    ],
    source: ""
  },

  massage: {
    title: "Wellness Massage",
    summary:
      "Hands-on massage focused on relaxation, stress relief and overall well-being. It is a wellness service and does not treat specific medical conditions.",
    points: ["Relaxation", "Stress relief", "Overall well-being"],
    sectionsTitle: "",
    sections: [
      // Add more information here, for example:
      // { heading: "What to expect", text: "…" }
    ],
    source: ""
  }
};

/* Shown at the bottom of every pop-up (same wording as the footer note). */
window.SERVICE_INFO_NOTE =
  "Our services support wellness and movement and do not replace medical diagnosis or treatment. Please consult your doctor about medical conditions.";
