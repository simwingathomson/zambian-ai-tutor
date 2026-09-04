from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Grade, Subject, Topic, Subtopic


GRADE_NAMES = ["Grade 7", "Grade 9", "Grade 12"]


SUBJECTS = {
    "Grade 7": [
        "English",
        "Mathematics",
        "Integrated Science",
        "Social Studies",
        "Civic Education",
        "Creative and Technology Studies",
        "Physical Education",
        "Religious Education",
        "Zambian Languages",
    ],
    "Grade 9": [
        "English",
        "Mathematics",
        "Integrated Science",
        "Social Studies",
        "Civic Education",
        "Business Studies",
        "Computer Studies",
        "Religious Education",
        "Zambian Languages",
    ],
    "Grade 12": [
        "English",
        "Mathematics",
        "Biology",
        "Chemistry",
        "Physics",
        "Geography",
        "History",
        "Civic Education",
        "Computer Studies",
        "Business Studies",
        "Agricultural Science",
        "Additional Mathematics",
    ],
}


# Grade 7 Mathematics curriculum structure.
#
# Based primarily on:
# - Zambia Ministry of Education / Curriculum Development Centre
#   Mathematics Syllabus Grades 1-7
# - ECZ Grade 7 Composite Examination Performance Reports
#
# The structure is intentionally stored as:
# Topic -> Subtopic
# so that later AI features can associate questions and learning
# materials with precise curriculum locations.

GRADE_7_MATHEMATICS = {
    "Number and Notation": [
        "Place value",
        "Numbers up to 1,000,000",
        "Roman numerals",
        "Reading and writing numbers",
        "Ordering and comparing numbers",
    ],

    "Sets": [
        "Set notation",
        "Membership of a set",
        "Empty sets",
        "Equal sets",
        "Equivalent sets",
        "Intersection of sets",
        "Union of sets",
        "Subsets",
        "Number of subsets",
        "Venn diagrams",
    ],

    "Addition and Subtraction": [
        "Addition of whole numbers",
        "Subtraction of whole numbers",
        "Addition of integers",
        "Subtraction of integers",
        "Addition of mixed numbers",
        "Subtraction of mixed numbers",
        "Number-line methods",
        "Problem solving",
    ],

    "Multiplication and Division": [
        "Multiplication of whole numbers",
        "Division of whole numbers",
        "Multiplication of integers",
        "Division of integers",
        "Multiplication of fractions",
        "Division of fractions",
        "Problem solving",
    ],

    "Fractions": [
        "Proper fractions",
        "Improper fractions",
        "Mixed numbers",
        "Equivalent fractions",
        "Addition of fractions",
        "Subtraction of fractions",
        "Multiplication of fractions",
        "Division of fractions",
        "Fractions in real-life problems",
    ],

    "Decimals": [
        "Decimal place value",
        "Addition of decimals",
        "Subtraction of decimals",
        "Multiplication of decimals",
        "Division of decimals",
        "Converting fractions to decimals",
        "Converting decimals to fractions",
        "Decimal problem solving",
    ],

    "Percentages": [
        "Meaning of percentage",
        "Converting fractions to percentages",
        "Converting decimals to percentages",
        "Converting percentages to fractions",
        "Calculating percentages",
        "Percentage increase",
        "Percentage decrease",
        "Percentage problem solving",
    ],

    "Ratio and Proportion": [
        "Meaning of ratio",
        "Writing ratios",
        "Simplifying ratios",
        "Comparing quantities using ratio",
        "Dividing quantities in a given ratio",
        "Direct proportion",
        "Inverse proportion",
        "Ratio and proportion problems",
    ],

    "Factors and Multiples": [
        "Factors",
        "Multiples",
        "Prime numbers",
        "Composite numbers",
        "Prime factors",
        "Highest Common Factor",
        "Lowest Common Multiple",
    ],

    "Integers": [
        "Positive integers",
        "Negative integers",
        "Number line",
        "Comparing integers",
        "Ordering integers",
        "Addition of integers",
        "Subtraction of integers",
        "Multiplication of integers",
        "Division of integers",
    ],

    "Number Bases": [
        "Base ten",
        "Base two",
        "Base five",
        "Base eight",
        "Place value in different bases",
        "Converting between bases",
        "Addition in different bases",
        "Subtraction in different bases",
    ],

    "Index Notation": [
        "Meaning of indices",
        "Base and index",
        "Writing numbers in index form",
        "Expanded form",
        "Evaluating powers",
        "Index laws",
        "Positive integral indices",
    ],

    "Combined Operations": [
        "Order of operations",
        "BODMAS",
        "Using brackets",
        "Combined addition and subtraction",
        "Combined multiplication and division",
        "Mixed operations",
        "Problem solving",
    ],

    "Approximations": [
        "Rounding off whole numbers",
        "Rounding decimals",
        "Decimal places",
        "Significant figures",
        "Estimating answers",
        "Approximation in problem solving",
    ],

    "Number Patterns and Sequences": [
        "Number patterns",
        "Increasing sequences",
        "Decreasing sequences",
        "Rules for sequences",
        "Generating sequences",
        "Perfect squares",
        "Perfect cubes",
        "Fibonacci sequence",
    ],

    "Equations": [
        "Open sentences",
        "Variables",
        "Constants",
        "Terms",
        "Coefficients",
        "Simple equations",
        "Balancing equations",
        "Solving linear equations",
        "Equations from word problems",
    ],

    "Inequations": [
        "Meaning of inequalities",
        "Inequality symbols",
        "Open sentences",
        "Simple inequations",
        "Solving inequations",
        "Representing solutions on a number line",
        "Inequations from word problems",
    ],

    "Social and Commercial Arithmetic": [
        "Cost price",
        "Selling price",
        "Profit",
        "Loss",
        "Profit percentage",
        "Loss percentage",
        "Simple interest",
        "Discount",
        "Money and currency",
        "Transportation fares",
        "Timetables",
        "Distance charts",
    ],

    "Measures": [
        "SI units",
        "Length",
        "Mass",
        "Capacity",
        "Time",
        "Money",
        "Temperature",
        "Speed",
        "Unit conversions",
        "Measurement problems",
    ],

    "Plane and Solid Shapes": [
        "Plane shapes",
        "Triangles",
        "Quadrilaterals",
        "Polygons",
        "Regular polygons",
        "Solid shapes",
        "Faces",
        "Edges",
        "Vertices",
        "Symmetry",
        "Nets of solids",
    ],

    "Angles": [
        "Types of angles",
        "Acute angles",
        "Right angles",
        "Obtuse angles",
        "Reflex angles",
        "Straight angles",
        "Measuring angles",
        "Estimating angles",
        "Angles in triangles",
        "Angles in polygons",
    ],

    "Relations and Maps": [
        "Ordered pairs",
        "Mapping diagrams",
        "Relations",
        "Coordinates",
        "Reading maps",
        "Scale",
        "Directions",
        "Distance on maps",
    ],

    "Statistics": [
        "Collecting data",
        "Organising data",
        "Frequency tables",
        "Pictographs",
        "Bar graphs",
        "Line graphs",
        "Stem-and-leaf plots",
        "Mean",
        "Median",
        "Mode",
        "Range",
        "Interpreting data",
    ],
}


def get_or_create_grade(db: Session, name: str) -> Grade:
    grade = db.query(Grade).filter(Grade.name == name).first()

    if grade is None:
        grade = Grade(name=name)
        db.add(grade)
        db.flush()

    return grade


def get_or_create_subject(
    db: Session,
    grade: Grade,
    name: str,
) -> Subject:
    subject = (
        db.query(Subject)
        .filter(
            Subject.grade_id == grade.id,
            Subject.name == name,
        )
        .first()
    )

    if subject is None:
        subject = Subject(
            grade_id=grade.id,
            name=name,
        )
        db.add(subject)
        db.flush()

    return subject


def get_or_create_topic(
    db: Session,
    subject: Subject,
    name: str,
) -> Topic:
    topic = (
        db.query(Topic)
        .filter(
            Topic.subject_id == subject.id,
            Topic.name == name,
        )
        .first()
    )

    if topic is None:
        topic = Topic(
            subject_id=subject.id,
            name=name,
        )
        db.add(topic)
        db.flush()

    return topic


def get_or_create_subtopic(
    db: Session,
    topic: Topic,
    name: str,
) -> Subtopic:
    subtopic = (
        db.query(Subtopic)
        .filter(
            Subtopic.topic_id == topic.id,
            Subtopic.name == name,
        )
        .first()
    )

    if subtopic is None:
        subtopic = Subtopic(
            topic_id=topic.id,
            name=name,
        )
        db.add(subtopic)

    return subtopic


def seed_grades_and_subjects(db: Session) -> None:
    for grade_name, subject_names in SUBJECTS.items():
        grade = get_or_create_grade(db, grade_name)

        for subject_name in subject_names:
            get_or_create_subject(
                db,
                grade,
                subject_name,
            )


def seed_grade_7_mathematics(db: Session) -> None:
    grade = (
        db.query(Grade)
        .filter(Grade.name == "Grade 7")
        .first()
    )

    if grade is None:
        raise RuntimeError("Grade 7 does not exist.")

    mathematics = (
        db.query(Subject)
        .filter(
            Subject.grade_id == grade.id,
            Subject.name == "Mathematics",
        )
        .first()
    )

    if mathematics is None:
        raise RuntimeError(
            "Grade 7 Mathematics subject does not exist."
        )

    for topic_name, subtopic_names in GRADE_7_MATHEMATICS.items():
        topic = get_or_create_topic(
            db,
            mathematics,
            topic_name,
        )

        for subtopic_name in subtopic_names:
            get_or_create_subtopic(
                db,
                topic,
                subtopic_name,
            )


def main() -> None:
    db = SessionLocal()

    try:
        seed_grades_and_subjects(db)
        seed_grade_7_mathematics(db)

        db.commit()

        print("Grades and subjects seeded successfully.")
        print("Grade 7 Mathematics curriculum seeded successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()