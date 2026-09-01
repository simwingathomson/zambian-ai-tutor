from sqlalchemy import create_engine, inspect, text

from app.core.config import get_settings


def main() -> None:
    engine = create_engine(get_settings().database_url)
    wanted_tables = [
        "users",
        "student_profiles",
        "grades",
        "subjects",
        "topics",
        "subtopics",
        "alembic_version",
    ]

    with engine.connect() as connection:
        inspector = inspect(connection)
        print(f"dialect={engine.dialect.name}")
        print(f"driver={engine.dialect.driver}")
        print(f"tables={{{', '.join(f'{table}: {inspector.has_table(table)}' for table in wanted_tables)}}}")

        enum_rows = connection.execute(
            text(
                """
                select n.nspname as schema, t.typname, array_agg(e.enumlabel order by e.enumsortorder) as labels
                from pg_type t
                join pg_enum e on t.oid = e.enumtypid
                join pg_namespace n on n.oid = t.typnamespace
                where n.nspname not in ('pg_catalog', 'information_schema') and t.typname = 'userrole'
                group by n.nspname, t.typname
                order by n.nspname
                """
            )
        ).mappings()
        print(f"enums={[dict(row) for row in enum_rows]}")

        if inspector.has_table("alembic_version"):
            versions = connection.execute(text("select version_num from alembic_version")).scalars().all()
        else:
            versions = []
        print(f"alembic_versions={versions}")

        if inspector.has_table("grades"):
            grades = connection.execute(text("select name from grades order by name")).scalars().all()
        else:
            grades = []
        print(f"grades={grades}")


if __name__ == "__main__":
    main()
