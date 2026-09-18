import "server-only";

// ✍️ Edit your letters here.
// - body: paragraphs separated by a blank line
// - drawing: put your image in /public/drawings and point to it (png/jpg/svg).
//   Keep it in /public (same origin) so "save as image" can include it.

export const AUTHOR = {
  /** How your name shows on letters and in comments. */
  name: "Aomzin",
  signOff: "เป็นกำลังใจให้เสมอ",
};

export type Letter = {
  id: string;
  greeting: string;
  body: string;
  /** Overrides AUTHOR.signOff (e.g. English for Billy). */
  signOff?: string;
  drawing?: { src: string; caption?: string };
};

export const LETTERS: Record<string, Letter> = {
  bam: {
    id: "bam",
    greeting: "ถึง Bam",
    body: `สวัสดีเจ๊ ยัยแบมน่ะ เก่งมากกกกกก ดีไซน์เนอร์เทพเดพได้จะไปหาที่ไหนได้อีกล่ะแม่ ชั้นอยากประกาศให้โลกรู้ว่าเรามีคนเก่งๆแบบนี้อยู่ด้วยล่ะ !! 
    
    ชั้นขอให้เธอได้ประสบความสำเร็จในสิ่งที่ต้องการ ขอให้ดวงดี ฝนตกในวันที่พกร่ม แว๊นรถไปไหนก็เจอแต่ไฟเขียว ยิ้มให้ตัวเองในวันที่ถึงแม้ว่าไม่มีใครทำให้เรายิ้มได้ 
    
    ชั้นดีใจมากกมากกก ที่ได้ร่วมงานกัน นานๆทีจะเจอคนที่พากันหัวเราะกับรูปเราเมื่อตอนประถม อยู่ด้วยกันแล้วสบายใจประหนึ่งว่าเราสนิทกันมานาน ขอบคุณที่คอยไกด์และให้ฟีดแบ็กในเรื่องงานนะ ขอบคุณที่แบมเข้ามาช่วยปั่นงาน ช่วยสุม ช่วยหยุม จนงานมันออกมาดีด้วยีมือของสองเรา

    ไอเริ้ฟยูมากๆ ในเส้นทางข้างหน้าขอให้เจอแต่คนใจดีและคนเก่งๆ เป็นธรรม ใช้ชีวิตทุกๆวันด้วยความราบรื่น ถึงจะเหนื่อยหน่อย ก็อย่าลืมไปออกกำลังกาย ดูแลตัวเองเด้ออออออออ

Thank you for every little laugh at the desk. I'll miss you a lot.`,
    drawing: { src: "/drawings/bam.png" },
  },
  beckham: {
    id: "beckham",
    greeting: "ถึง Beckham",
    body: `เอาจริงๆดีที่ใจที่ได้เจอและรู้จักกับคนเก่งๆมากกกๆ ยิ่งได้รู้จักกับคนที่ทำงานอาร์ตได้อีกถือว่าโชคดีมาก

ขอบคุณที่คอยช่วยเหลือและให้คำปรึกษาในเรื่องงานเสมอ ขอบคุณที่คอยสอนและให้คำแนะนำดีๆ พี่เบ็คแม่งเป็นเดพที่พูดรู้เรื่อง พูดดี และเห็นได้ชัดเลยว่าสอนรู้เรื่องมากๆ แบบว่าไปเปิดคอร์สสอนเด็กเขียนโค้ดได้เลยอ่ะ

ขอให้พี่เบคได้ประความสำเร็จในสิ่งที่ต้องการนะ ในอนาคตก็ขอให้เจอคนที่เก่งๆ อยากทำอะไรก็ได้ทำ ไม่ต้องมีเรื่องเครียดและไม่ต้องมาแบกรับความรู้สึกคนอื่น 

Keep being awesome. See you outside of work!`,
    drawing: { src: "/drawings/beckham.png" },
  },
  mhok: {
    id: "mhok",
    greeting: "ถึง Mhok",
    body: `สุดยอด AI Fullstack Flutter Native Engineer ได้จับทุกอย่างไปเลยสุดยอดจริง

ดีใจที่ได้ทำงานด้วยนะ ต่อจากนี้ก็ขอให้ได้เจอคนเก่งๆที่ทำให้เราได้เติบโตและพัฒนาสกิลต่างๆ อย่าลืมออกไปทำอะไรหลายๆอย่างที่เราไม่เคยทำ ทั้งเรื่องงานและกิจกรรมต่างๆ รักษาสุขภาพภาพ (ทั้งกายและใจ) และขอให้ได้สมหวังในทุกเรื่องเลย คริคริ

Wishing you all the best in your present and next adventure!`,
    drawing: { src: "/drawings/mhok.png" },
  },
  junior: {
    id: "junior",
    greeting: "ถึง Junior",
    body: `ไม่รู้เคยบอกไปแล้วรึยัง แต่พี่เป็นคนที่หนูนเคารพนับถือมากๆ เป็นหัวหน้าในแบบที่ว่า ถ้าเราโตไปแล้วเราก็อยากเก่งและทรีตคนอื่นแบบนี้จูนี่แหละ 

ขอบคุณสำหรับโอกาสต่างๆนะคะ ยินดีที่ได้ร่วมงานกับพี่จู แล้วก็พี่โฟมด้วย ที่รับออมเข้ามาเป็นลูกสมุนเด็กเกาะเบาะไปดู BNK พี่จูพี่โฟมสอนและให้คำแนะนำหลายอย่างมากมาย เป็นพี่ผู้ใหญ่ที่ออมเชื่อฟัง 

ขอให้พี่จูสมหวังในสิ่งที่ต้องการ อย่าลืมดูแลตัวเอง รักษาสุขภาพให้แข็งแรงด้วยพี่อย่าทำงานหนักมากเกินนนน 

I'll support you always, NG.`,
    drawing: { src: "/drawings/junior.png" },
  },
  billy: {
    id: "billy",
    greeting: "Dear Billy",
    body: `The Super Senior IT Support Intern Billy, your attention and encouragement have made a huge difference in my work and life. 
    
    Thank you for every joke and every snack you shared. You turned ordinary days into good ones. you are my role model fot a healthy body 💪🏻.

Wishing you good health, great projects, and a big raise.

I hope we can meet again soon!`,
    signOff: "Good luck always",
    drawing: { src: "/drawings/billy.png" },
  },
};
